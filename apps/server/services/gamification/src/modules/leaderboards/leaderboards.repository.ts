import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { ILeaderboardsRepository } from '@server/gamification/interfaces/repositories';

@Injectable()
export class LeaderboardsRepository implements ILeaderboardsRepository {
    private readonly logger = new Logger(LeaderboardsRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    async getTopByXp(limit: number) {
        return this.prisma.userGamification.findMany({
            where: {
                user: {
                    deletedAt: null,
                    role: 'learner',
                },
            },
            orderBy: [
                { totalXp: 'desc' },
                { user: { createdAt: 'asc' } },
            ],
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        displayName: true,
                        avatarUrl: true,
                        createdAt: true,
                    }
                },
            },
        });
    }

    async getTopByWeeklyStreak(limit: number) {
        return this.prisma.userGamification.findMany({
            where: {
                weeklyActiveCount: { gt: 0 },
                user: {
                    deletedAt: null,
                    role: 'learner',
                },
            },
            orderBy: [
                { weeklyActiveCount: 'desc' },
                { user: { createdAt: 'asc' } },
            ],
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        displayName: true,
                        avatarUrl: true,
                        createdAt: true,
                    },
                },
            },
        });
    }

    async getUserXpRank(userId: string) {
        const userGamification = await this.prisma.userGamification.findUnique({
            where: { userId },
            include: { user: { select: { createdAt: true } } },
        });

        if (!userGamification) return 0;

        const betterScoreCount = await this.prisma.userGamification.count({
            where: {
                user: { deletedAt: null, role: 'learner' },
                totalXp: { gt: userGamification.totalXp },
            },
        });

        const sameScoreBetterTimeCount = await this.prisma.userGamification.count({
            where: {
                totalXp: userGamification.totalXp,
                user: {
                    deletedAt: null,
                    role: 'learner',
                    createdAt: { lt: userGamification.user.createdAt },
                },
            },
        });

        return betterScoreCount + sameScoreBetterTimeCount + 1;
    }

    async getUserWeeklyRank(userId: string) {
        const userGamification = await this.prisma.userGamification.findUnique({
            where: { userId },
            include: { user: { select: { createdAt: true } } },
        });

        if (!userGamification) return 0;

        const betterStreakCount = await this.prisma.userGamification.count({
            where: {
                user: { deletedAt: null, role: 'learner' },
                weeklyActiveCount: { gt: userGamification.weeklyActiveCount },
            },
        });

        const sameStreakBetterTimeCount = await this.prisma.userGamification.count({
            where: {
                weeklyActiveCount: userGamification.weeklyActiveCount,
                user: {
                    deletedAt: null,
                    role: 'learner',
                    createdAt: { lt: userGamification.user.createdAt },
                },
            },
        });

        return betterStreakCount + sameStreakBetterTimeCount + 1;
    }

    async countLearners(filter: any = {}) {
        return this.prisma.user.count({
            where: {
                role: 'learner',
                deletedAt: null,
                ...filter,
            },
        });
    }
}
