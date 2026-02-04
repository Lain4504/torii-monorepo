import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { LeaderboardDto, LeaderboardUserDto } from '@workspace/schemas';

@Injectable()
export class LeaderboardService {
    private readonly logger = new Logger(LeaderboardService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Ensure user has a gamification record
     */
    private async ensureUserGamification(userId: string) {
        try {
            await this.prisma.userGamification.upsert({
                where: { userId },
                create: {
                    userId,
                    level: 1,
                    currentXp: 0,
                    totalXp: 0,
                    currentStreak: 0,
                    longestStreak: 0
                },
                update: {}, // Do nothing if exists
            });
        } catch (error) {
            this.logger.error(`Failed to ensure gamification for user ${userId}`, error.stack);
        }
    }

    async getGlobalLeaderboard(userId?: string): Promise<LeaderboardDto> {
        if (userId) {
            await this.ensureUserGamification(userId);
        }

        // Use UserGamification as primary
        const topGamification = await this.prisma.userGamification.findMany({
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
            take: 100,
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

        const users: LeaderboardUserDto[] = topGamification.map((g, index) => ({
            id: g.user.id,
            displayName: g.user.displayName,
            avatarUrl: g.user.avatarUrl,
            xp: g.totalXp,
            level: g.level,
            rank: index + 1,
            currentStreak: g.currentStreak,
        }));

        let currentUser: LeaderboardUserDto | undefined;
        if (userId) {
            const userIndex = users.findIndex((u) => u.id === userId);
            if (userIndex !== -1) {
                currentUser = users[userIndex];
            } else {
                // Fetch current user rank
                const userGamification = await this.prisma.userGamification.findUnique({
                    where: { userId },
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

                if (userGamification) {
                    const userXp = userGamification.totalXp;

                    // Count users with more XP
                    const betterScoreCount = await this.prisma.userGamification.count({
                        where: {
                            user: {
                                deletedAt: null,
                                role: 'learner',
                            },
                            totalXp: { gt: userXp },
                        },
                    });

                    // Count users with same XP but joined earlier
                    const sameScoreBetterTimeCount = await this.prisma.userGamification.count({
                        where: {
                            totalXp: userXp,
                            user: {
                                deletedAt: null,
                                role: 'learner',
                                createdAt: { lt: userGamification.user.createdAt },
                            },
                        },
                    });

                    currentUser = {
                        id: userGamification.user.id,
                        displayName: userGamification.user.displayName,
                        avatarUrl: userGamification.user.avatarUrl,
                        xp: userXp,
                        level: userGamification.level,
                        rank: betterScoreCount + sameScoreBetterTimeCount + 1,
                        currentStreak: userGamification.currentStreak,
                    };
                }
            }
        }

        const totalUsers = await this.prisma.user.count({
            where: { role: 'learner', deletedAt: null },
        });

        return {
            users,
            currentUser,
            totalUsers,
            type: 'global',
        };
    }

    async getStreakLeaderboard(userId?: string): Promise<LeaderboardDto> {
        if (userId) {
            await this.ensureUserGamification(userId);
        }
        // Similarly for streak leaderboard
        const topStreaks = await this.prisma.userGamification.findMany({
            where: {
                currentStreak: { gt: 0 },
                user: {
                    deletedAt: null,
                    role: 'learner',
                },
            },
            orderBy: [
                { currentStreak: 'desc' },
                { user: { createdAt: 'asc' } },
            ],
            take: 100,
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

        const users: LeaderboardUserDto[] = topStreaks.map((g, index) => ({
            id: g.user.id,
            displayName: g.user.displayName,
            avatarUrl: g.user.avatarUrl,
            xp: g.totalXp,
            level: g.level,
            rank: index + 1,
            currentStreak: g.currentStreak,
        }));

        let currentUser: LeaderboardUserDto | undefined;
        if (userId) {
            const userIndex = users.findIndex((u) => u.id === userId);
            if (userIndex !== -1) {
                currentUser = users[userIndex];
            } else {
                const userGamification = await this.prisma.userGamification.findUnique({
                    where: { userId },
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

                if (userGamification) {
                    // Count users with higher streak
                    const betterStreakCount = await this.prisma.userGamification.count({
                        where: {
                            currentStreak: { gt: userGamification.currentStreak },
                            user: {
                                deletedAt: null,
                                role: 'learner',
                            },
                        },
                    });

                    // Count users with same streak but joined earlier
                    const sameStreakBetterTimeCount = await this.prisma.userGamification.count({
                        where: {
                            currentStreak: userGamification.currentStreak,
                            user: {
                                deletedAt: null,
                                role: 'learner',
                                createdAt: { lt: userGamification.user.createdAt },
                            },
                        },
                    });

                    currentUser = {
                        id: userGamification.user.id,
                        displayName: userGamification.user.displayName,
                        avatarUrl: userGamification.user.avatarUrl,
                        xp: userGamification.totalXp,
                        level: userGamification.level,
                        rank: betterStreakCount + sameStreakBetterTimeCount + 1,
                        currentStreak: userGamification.currentStreak,
                    };
                }
            }
        }

        const totalUsers = await this.prisma.user.count({
            where: {
                role: 'learner',
                deletedAt: null,
                gamification: {
                    currentStreak: { gt: 0 }
                }
            },
        });

        return {
            users,
            currentUser,
            totalUsers,
            type: 'streak',
        };
    }
}
