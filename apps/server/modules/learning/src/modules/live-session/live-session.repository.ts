import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { LiveSession, Prisma } from '@prisma/generated';
import type { ILiveSessionRepository } from '@server/learning/interfaces/repositories';

/**
 * Live Session Repository
 * Handles database operations for LiveSession entity
 */
@Injectable()
export class LiveSessionRepository implements ILiveSessionRepository {
    private readonly logger = new Logger(LiveSessionRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string): Promise<LiveSession | null> {
        return this.prisma.liveSession.findUnique({
            where: { id },
        });
    }

    async findByCourseId(courseId: string): Promise<LiveSession[]> {
        return this.prisma.liveSession.findMany({
            where: { courseId },
            orderBy: { scheduledAt: 'asc' },
        });
    }

    async findByLecturerId(lecturerId: string): Promise<LiveSession[]> {
        return this.prisma.liveSession.findMany({
            where: { lecturerId },
            orderBy: { scheduledAt: 'asc' },
        });
    }

    async create(data: Prisma.LiveSessionCreateInput): Promise<LiveSession> {
        return this.prisma.liveSession.create({
            data,
        });
    }

    async update(id: string, data: Prisma.LiveSessionUpdateInput): Promise<LiveSession> {
        return this.prisma.liveSession.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.liveSession.delete({
            where: { id },
        });
    }

    async findInRange(start: Date, end: Date): Promise<LiveSession[]> {
        return this.prisma.liveSession.findMany({
            where: {
                scheduledAt: {
                    gte: start,
                    lte: end,
                },
            },
            orderBy: { scheduledAt: 'asc' },
        });
    }
}

