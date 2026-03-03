import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { IActivitiesRepository } from '@server/gamification/interfaces/repositories';

@Injectable()
export class ActivitiesRepository implements IActivitiesRepository {
    private readonly logger = new Logger(ActivitiesRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    async findDailyActivity(userId: string, date: string, activityType: string) {
        return this.prisma.dailyActivity.findUnique({
            where: {
                userId_date_activityType: {
                    userId,
                    date,
                    activityType: activityType as any,
                },
            },
        });
    }

    async createDailyActivity(data: any) {
        return this.prisma.dailyActivity.create({
            data,
        });
    }

    async findHistory(userId: string, skip: number, take: number, type?: string): Promise<[any[], number]> {
        const where: any = { userId };
        if (type) {
            where.type = type;
        }

        return Promise.all([
            this.prisma.gamificationHistory.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            this.prisma.gamificationHistory.count({ where }),
        ]);
    }
}
