import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@server/shared/prisma/prisma.service';

@Injectable()
export class ClassroomCronService {
    private readonly logger = new Logger(ClassroomCronService.name);

    constructor(private readonly prisma: PrismaService) { }

    @Cron(CronExpression.EVERY_HOUR)
    async handleClassTransitions() {
        this.logger.log('Checking for class state transitions...');
        const now = new Date();

        // 1. DRAFT -> ENROLLING (if enrollmentOpenAt <= now)
        // For VOD classes
        const vodToEnroll = await this.prisma.vodClass.findMany({
            where: {
                class: { status: 'DRAFT' },
                enrollmentOpenAt: { lte: now },
            },
            select: { classId: true }
        });
        if (vodToEnroll.length > 0) {
            await this.prisma.class.updateMany({
                where: { id: { in: vodToEnroll.map(v => v.classId) } },
                data: { status: 'ENROLLING' },
            });
            this.logger.log(`Activated ${vodToEnroll.length} VOD classes to ENROLLING`);
        }

        // For LIVE classes
        const liveToEnroll = await this.prisma.liveClass.findMany({
            where: {
                class: { status: 'DRAFT' },
                enrollmentOpenAt: { lte: now },
            },
            select: { classId: true }
        });
        if (liveToEnroll.length > 0) {
            await this.prisma.class.updateMany({
                where: { id: { in: liveToEnroll.map(v => v.classId) } },
                data: { status: 'ENROLLING' },
            });
            this.logger.log(`Activated ${liveToEnroll.length} LIVE classes to ENROLLING`);
        }

        // 2. VOD classes: ENROLLING -> IN_PROGRESS if enrollmentOpenAt <= now
        // Note: For VOD, usually it stays ENROLLING, but if the business logic expects IN_PROGRESS for visibility...
        const vodToStart = await this.prisma.vodClass.findMany({
            where: {
                class: { status: 'ENROLLING' },
                enrollmentOpenAt: { lte: now },
            },
            select: { classId: true }
        });
        if (vodToStart.length > 0) {
            const result = await this.prisma.class.updateMany({
                where: { id: { in: vodToStart.map(v => v.classId) } },
                data: { status: 'IN_PROGRESS' },
            });
            this.logger.log(`Moved ${result.count} VOD classes to IN_PROGRESS`);
        }

        // 3. LIVE classes: ENROLLING -> IN_PROGRESS if startDate <= now
        const liveToStart = await this.prisma.liveClass.findMany({
            where: {
                class: { status: 'ENROLLING' },
                startDate: { lte: now },
            },
            select: { classId: true }
        });
        if (liveToStart.length > 0) {
            const result = await this.prisma.class.updateMany({
                where: { id: { in: liveToStart.map(v => v.classId) } },
                data: { status: 'IN_PROGRESS' },
            });
            this.logger.log(`Started ${result.count} LIVE classes`);
        }

        // 4. LIVE classes: IN_PROGRESS -> COMPLETED if endDate <= now
        const liveToComplete = await this.prisma.liveClass.findMany({
            where: {
                class: { status: 'IN_PROGRESS' },
                endDate: { lte: now },
            },
            select: { classId: true }
        });
        if (liveToComplete.length > 0) {
            const result = await this.prisma.class.updateMany({
                where: { id: { in: liveToComplete.map(v => v.classId) } },
                data: { status: 'COMPLETED' },
            });
            this.logger.log(`Completed ${result.count} LIVE classes`);
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleEnrollmentExpirations() {
        this.logger.log('Checking for enrollment expirations...');
        const now = new Date();

        const expired = await this.prisma.enrollment.updateMany({
            where: {
                status: 'ACTIVE',
                expiresAt: { lte: now },
            },
            data: { status: 'EXPIRED' },
        });

        if (expired.count > 0) {
            this.logger.log(`Expired ${expired.count} enrollments`);
        }
    }
}
