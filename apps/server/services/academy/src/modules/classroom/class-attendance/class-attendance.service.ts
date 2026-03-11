import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
    ClassAttendanceCreateDto,
    ClassAttendanceQueryDto,
    ClassAttendanceUpdateDto,
} from './dto/class-attendance.dto';
import { AuditLoggerService } from '../../audit-logger.service';

@Injectable()
export class ClassAttendanceService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly audit: AuditLoggerService,
    ) { }

    async findAll(query: ClassAttendanceQueryDto) {
        const { sessionId, userId, page = 1, limit = 100 } = query;
        const skip = (Number(page) - 1) * Number(limit);
        const take = Number(limit);

        const where: any = {};
        if (sessionId) where.sessionId = sessionId;
        if (userId) where.userId = userId;

        const [items, total] = await Promise.all([
            this.prisma.classAttendance.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            displayName: true,
                            avatarUrl: true,
                        },
                    },
                    session: true,
                },
                orderBy: { recordedAt: 'desc' },
                skip,
                take,
            }),
            this.prisma.classAttendance.count({ where }),
        ]);

        return { items, total, page, limit };
    }

    async findById(id: string) {
        const item = await this.prisma.classAttendance.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        displayName: true,
                        avatarUrl: true,
                    },
                },
                session: true,
            },
        });
        if (!item) throw new NotFoundException('Attendance record not found');
        return item;
    }

    async create(input: ClassAttendanceCreateDto, requesterId = 'SYSTEM') {
        // 1. Validate session exists and is for a LIVE class
        const session = await this.prisma.liveScheduleSession.findUnique({
            where: { id: input.sessionId },
            include: {
                class: true,
            },
        });

        if (!session) throw new NotFoundException('LiveScheduleSession not found');
        if (session.class.mode !== 'LIVE') {
            throw new BadRequestException(
                'Attendance can only be recorded for LIVE classes',
            );
        }

        const classId = session.classId;

        // 2. Validate userId has an ACTIVE enrollment in this class
        const enrollment = await this.prisma.enrollment.findFirst({
            where: {
                classId,
                userId: input.userId,
                status: 'ACTIVE',
            },
        });

        if (!enrollment) {
            throw new BadRequestException('User does not have an active enrollment in this class');
        }

        // 3. Upsert attendance record
        const attendance = await this.prisma.classAttendance.upsert({
            where: {
                sessionId_userId: {
                    sessionId: input.sessionId,
                    userId: input.userId,
                },
            },
            create: {
                sessionId: input.sessionId,
                userId: input.userId,
                status: input.status,
            },
            update: {
                status: input.status,
                recordedAt: new Date(),
            },
        });

        await this.audit.log({
            userId: requesterId,
            action: 'attendance.record',
            entity: 'ClassAttendance',
            entityId: attendance.id,
            description: `Recorded ${input.status} for user ${input.userId} in session ${input.sessionId}`,
            metadata: { sessionId: input.sessionId, userId: input.userId, status: input.status },
        });

        return attendance;
    }

    async update(id: string, input: ClassAttendanceUpdateDto, requesterId = 'SYSTEM') {
        const existing = await this.findById(id);

        const updated = await this.prisma.classAttendance.update({
            where: { id },
            data: {
                status: input.status,
                recordedAt: new Date(),
            },
        });

        await this.audit.log({
            userId: requesterId,
            action: 'attendance.update',
            entity: 'ClassAttendance',
            entityId: id,
            description: `Updated attendance status for user ${existing.userId} to ${input.status}`,
            oldValues: { status: existing.status },
            newValues: { status: updated.status },
        });

        return updated;
    }

    async delete(id: string, requesterId = 'SYSTEM') {
        const existing = await this.findById(id);
        await this.prisma.classAttendance.delete({ where: { id } });

        await this.audit.log({
            userId: requesterId,
            action: 'attendance.delete',
            entity: 'ClassAttendance',
            entityId: id,
            description: `Deleted attendance record for user ${existing.userId}`,
        });

        return { ok: true };
    }
}
