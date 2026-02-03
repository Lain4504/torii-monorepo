import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { LeaderboardDto, LeaderboardUserDto } from '@workspace/schemas';

@Injectable()
export class LeaderboardService {
    private readonly logger = new Logger(LeaderboardService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Ensure user has a stats record
     */
    private async ensureUserStats(userId: string) {
        try {
            await this.prisma.userStats.upsert({
                where: { userId },
                create: { userId, xp: 0, level: 1 },
                update: {}, // Do nothing if exists
            });

            // Also ensure streak record
            await this.prisma.userStreak.upsert({
                where: { userId },
                create: { userId, currentStreak: 0, longestStreak: 0 },
                update: {},
            });
        } catch (error) {
            this.logger.error(`Failed to ensure stats/streak for user ${userId}`, error.stack);
        }
    }

    async getGlobalLeaderboard(userId?: string): Promise<LeaderboardDto> {
        if (userId) {
            await this.ensureUserStats(userId);
        }

        // Use UserStats as primary to avoid NULL sorting issues with users without stats
        const topStats = await this.prisma.userStats.findMany({
            where: {
                user: {
                    deletedAt: null,
                    role: 'learner',
                },
            },
            orderBy: [
                { xp: 'desc' },
                { user: { createdAt: 'asc' } },
            ],
            take: 100,
            include: {
                user: {
                    include: {
                        streak: {
                            select: {
                                currentStreak: true,
                            },
                        },
                    },
                },
            },
        });

        const users: LeaderboardUserDto[] = topStats.map((stats, index) => ({
            id: stats.user.id,
            displayName: stats.user.displayName,
            avatarUrl: stats.user.avatarUrl,
            xp: stats.xp,
            level: stats.level,
            rank: index + 1,
            currentStreak: stats.user.streak?.currentStreak || 0,
        }));

        let currentUser: LeaderboardUserDto | undefined;
        if (userId) {
            const userIndex = users.findIndex((u) => u.id === userId);
            if (userIndex !== -1) {
                currentUser = users[userIndex];
            } else {
                // Fetch current user rank
                const user = await this.prisma.user.findUnique({
                    where: { id: userId },
                    include: {
                        stats: true,
                        streak: {
                            select: {
                                currentStreak: true,
                            },
                        },
                    },
                });

                if (user) {
                    const userXp = (user as any).stats?.xp ?? 0;

                    // Count users with more XP
                    const betterScoreCount = await this.prisma.userStats.count({
                        where: {
                            user: {
                                deletedAt: null,
                                role: 'learner',
                            },
                            xp: { gt: userXp },
                        },
                    });

                    // Count users with same XP but joined earlier
                    const sameScoreBetterTimeCount = await this.prisma.userStats.count({
                        where: {
                            xp: userXp,
                            user: {
                                deletedAt: null,
                                role: 'learner',
                                createdAt: { lt: user.createdAt },
                            },
                        },
                    });

                    currentUser = {
                        id: user.id,
                        displayName: user.displayName,
                        avatarUrl: user.avatarUrl,
                        xp: userXp,
                        level: (user as any).stats?.level ?? 1,
                        rank: betterScoreCount + sameScoreBetterTimeCount + 1,
                        currentStreak: user.streak?.currentStreak || 0,
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
            await this.ensureUserStats(userId);
        }
        // Similarly for streak leaderboard
        const topStreaks = await this.prisma.userStreak.findMany({
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
                        stats: {
                            select: {
                                xp: true,
                                level: true,
                            },
                        },
                    },
                },
            },
        });

        const users: LeaderboardUserDto[] = topStreaks.map((streak, index) => ({
            id: streak.user.id,
            displayName: streak.user.displayName,
            avatarUrl: streak.user.avatarUrl,
            xp: (streak.user as any).stats?.xp || 0,
            level: (streak.user as any).stats?.level || 1,
            rank: index + 1,
            currentStreak: streak.currentStreak,
        }));

        let currentUser: LeaderboardUserDto | undefined;
        if (userId) {
            const userIndex = users.findIndex((u) => u.id === userId);
            if (userIndex !== -1) {
                currentUser = users[userIndex];
            } else {
                const streak = await this.prisma.userStreak.findUnique({
                    where: { userId },
                    include: {
                        user: {
                            select: {
                                id: true,
                                displayName: true,
                                avatarUrl: true,
                                stats: {
                                    select: {
                                        xp: true,
                                        level: true,
                                    },
                                },
                                createdAt: true,
                            },
                        },
                    },
                });

                if (streak) {
                    // Count users with higher streak
                    const betterStreakCount = await this.prisma.userStreak.count({
                        where: {
                            currentStreak: { gt: streak.currentStreak },
                            user: {
                                deletedAt: null,
                                role: 'learner',
                            },
                        },
                    });

                    // Count users with same streak but joined earlier
                    const sameStreakBetterTimeCount = await this.prisma.userStreak.count({
                        where: {
                            currentStreak: streak.currentStreak,
                            user: {
                                deletedAt: null,
                                role: 'learner',
                                createdAt: { lt: streak.user.createdAt },
                            },
                        },
                    });

                    currentUser = {
                        id: streak.user.id,
                        displayName: streak.user.displayName,
                        avatarUrl: streak.user.avatarUrl,
                        xp: (streak.user as any).stats?.xp || 0,
                        level: (streak.user as any).stats?.level || 1,
                        rank: betterStreakCount + sameStreakBetterTimeCount + 1,
                        currentStreak: streak.currentStreak,
                    };
                }
            }
        }

        const totalUsers = await this.prisma.user.count({
            where: {
                role: 'learner',
                deletedAt: null,
                streak: {
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
