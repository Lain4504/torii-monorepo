import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { LeaderboardDto, LeaderboardUserDto } from '@workspace/schemas';

@Injectable()
export class LeaderboardService {
    private readonly logger = new Logger(LeaderboardService.name);

    constructor(private readonly prisma: PrismaService) { }

    async getGlobalLeaderboard(userId?: string): Promise<LeaderboardDto> {
        // Get top 100 users by XP
        const topUsers = await this.prisma.user.findMany({
            where: {
                deletedAt: null,
                role: 'learner',
            },
            orderBy: {
                xp: 'desc',
            },
            take: 100,
            select: {
                id: true,
                displayName: true,
                avatarUrl: true,
                xp: true,
                level: true,
                streak: {
                    select: {
                        currentStreak: true,
                    },
                },
            },
        });

        const users: LeaderboardUserDto[] = topUsers.map((user, index) => ({
            id: user.id,
            displayName: user.displayName,
            avatarUrl: user.avatarUrl,
            xp: user.xp,
            level: user.level,
            rank: index + 1,
            currentStreak: user.streak?.currentStreak || 0,
        }));

        let currentUser: LeaderboardUserDto | undefined;
        if (userId) {
            const userIndex = users.findIndex((u) => u.id === userId);
            if (userIndex !== -1) {
                currentUser = users[userIndex];
            } else {
                // Fetch current user rank if not in top 100
                const user = await this.prisma.user.findUnique({
                    where: { id: userId },
                    select: {
                        id: true,
                        displayName: true,
                        avatarUrl: true,
                        xp: true,
                        level: true,
                        streak: {
                            select: {
                                currentStreak: true,
                            },
                        },
                    },
                });

                if (user) {
                    const rank = await this.prisma.user.count({
                        where: {
                            deletedAt: null,
                            role: 'learner',
                            xp: { gt: user.xp },
                        },
                    });
                    currentUser = {
                        id: user.id,
                        displayName: user.displayName,
                        avatarUrl: user.avatarUrl,
                        xp: user.xp,
                        level: user.level,
                        rank: rank + 1,
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
        // Get top 100 users by current streak
        const topStreaks = await this.prisma.userStreak.findMany({
            where: {
                currentStreak: { gt: 0 },
                user: {
                    deletedAt: null,
                    role: 'learner',
                },
            },
            orderBy: {
                currentStreak: 'desc',
            },
            take: 100,
            include: {
                user: {
                    select: {
                        id: true,
                        displayName: true,
                        avatarUrl: true,
                        xp: true,
                        level: true,
                    },
                },
            },
        });

        const users: LeaderboardUserDto[] = topStreaks.map((streak, index) => ({
            id: streak.user.id,
            displayName: streak.user.displayName,
            avatarUrl: streak.user.avatarUrl,
            xp: streak.user.xp,
            level: streak.user.level,
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
                                xp: true,
                                level: true,
                            },
                        },
                    },
                });

                if (streak) {
                    const rank = await this.prisma.userStreak.count({
                        where: {
                            currentStreak: { gt: streak.currentStreak },
                            user: {
                                deletedAt: null,
                                role: 'learner',
                            },
                        },
                    });
                    currentUser = {
                        id: streak.user.id,
                        displayName: streak.user.displayName,
                        avatarUrl: streak.user.avatarUrl,
                        xp: streak.user.xp,
                        level: streak.user.level,
                        rank: rank + 1,
                        currentStreak: streak.currentStreak,
                    };
                }
            }
        }

        const totalUsers = await this.prisma.userStreak.count({
            where: {
                currentStreak: { gt: 0 },
                user: {
                    deletedAt: null,
                    role: 'learner',
                },
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
