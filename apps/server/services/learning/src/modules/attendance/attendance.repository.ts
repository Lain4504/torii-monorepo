import { Injectable } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { Attendance, Prisma } from '@prisma/generated';
import type { IAttendanceRepository } from '@server/learning/interfaces/repositories';

@Injectable()
export class AttendanceRepository implements IAttendanceRepository {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: Prisma.AttendanceCreateInput): Promise<Attendance> {
        return this.prisma.attendance.create({ data });
    }

    async findById(id: string): Promise<Attendance | null> {
        return this.prisma.attendance.findUnique({
            where: { id },
        });
    }

    async findBySessionAndUser(liveSessionId: string, userId: string): Promise<Attendance | null> {
        return this.prisma.attendance.findUnique({
            where: {
                liveSessionId_userId: {
                    liveSessionId,
                    userId,
                },
            },
        });
    }

    async update(id: string, data: Prisma.AttendanceUpdateInput): Promise<Attendance> {
        return this.prisma.attendance.update({
            where: { id },
            data,
        });
    }

    async findMany(options: {
        skip: number;
        take: number;
        where?: Prisma.AttendanceWhereInput;
        orderBy?: Prisma.AttendanceOrderByWithRelationInput;
        include?: Prisma.AttendanceInclude;
    }): Promise<Attendance[]> {
        return this.prisma.attendance.findMany({
            where: options.where,
            skip: options.skip,
            take: options.take,
            orderBy: options.orderBy || { createdAt: 'desc' },
            include: options.include,
        });
    }

    async count(where?: Prisma.AttendanceWhereInput): Promise<number> {
        return this.prisma.attendance.count({ where });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.attendance.delete({
            where: { id },
        });
    }
}
