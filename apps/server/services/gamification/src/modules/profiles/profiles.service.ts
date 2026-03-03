import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import Redis from 'ioredis';
import type { UserGamificationDto, StreakStatusDto } from '@workspace/schemas';
import { REDIS_CLIENT, PrismaService } from '@server/shared';
import type { IProfilesService } from '@server/gamification/interfaces/services';
import type { IProfilesRepository } from '@server/gamification/interfaces/repositories';
import { PROFILES_REPOSITORY_TOKEN } from '@server/gamification/interfaces/repositories';
import { GamificationTransactionType } from '@prisma/generated';

@Injectable()
export class ProfilesService implements IProfilesService {
    private readonly logger = new Logger(ProfilesService.name);

    constructor(
        @Inject(PROFILES_REPOSITORY_TOKEN) private readonly profilesRepository: IProfilesRepository,
        private readonly prisma: PrismaService,
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    async getGamificationProfile(userId: string): Promise<UserGamificationDto> {
        let gamification = await this.profilesRepository.findByUserId(userId);

        if (!gamification) {
            gamification = await this.profilesRepository.upsert(
                userId,
                {},
                {}
            );
        }

        const userBalance = await this.prisma.userBalance.findUnique({
            where: { userId }
        });

        return {
            id: gamification.id,
            userId: gamification.userId,
            level: gamification.level,
            currentXp: gamification.currentXp,
            totalXp: gamification.totalXp,
            points: (gamification as any).points,
            gems: gamification.gems,
            balance: userBalance?.balance || 0,
            currentStreak: gamification.currentStreak,
            longestStreak: gamification.longestStreak,
            lastActiveDate: gamification.lastActiveDate,
            freezeCount: gamification.freezeCount,
            totalActiveDays: gamification.totalActiveDays,
            weeklyActiveCount: gamification.weeklyActiveCount,
            monthlyActiveCount: gamification.monthlyActiveCount,
            updatedAt: gamification.updatedAt.toISOString(),
        } as any;
    }

    async getStreakStatus(userId: string): Promise<StreakStatusDto> {
        let gamification = await this.profilesRepository.findByUserId(userId);

        if (!gamification) {
            gamification = await this.profilesRepository.upsert(userId, {}, {});
        }

        const today = this.getToday();
        const isActiveToday = gamification.lastActiveDate === today;
        const yesterday = this.getYesterday();
        const willBreakTomorrow = !isActiveToday && gamification.lastActiveDate !== yesterday;

        const redisKey = `streak_toast:${userId}:${today}`;
        const toastShownToday = await this.redis.get(redisKey);
        const shouldShowToast = isActiveToday && !toastShownToday;

        const activities = await this.prisma.dailyActivity.findMany({
            where: {
                userId,
                date: { gte: this.getDaysAgo(7) },
            },
            select: { date: true },
            distinct: ['date'],
        });
        const recentActiveDates = activities.map(a => a.date);

        return {
            currentStreak: gamification.currentStreak,
            longestStreak: gamification.longestStreak,
            freezeCount: gamification.freezeCount,
            isActiveToday,
            willBreakTomorrow,
            lastActiveDate: gamification.lastActiveDate,
            totalActiveDays: gamification.totalActiveDays,
            weeklyActiveCount: gamification.weeklyActiveCount,
            monthlyActiveCount: gamification.monthlyActiveCount,
            recentActiveDates,
            shouldShowToast,
        };
    }

    async markStreakToastShown(userId: string): Promise<void> {
        const today = this.getToday();
        const redisKey = `streak_toast:${userId}:${today}`;

        const now = new Date();
        const endOfDay = new Date(now);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const secondsUntilEndDay = Math.max(1, Math.floor((endOfDay.getTime() - now.getTime()) / 1000));
        await this.redis.set(redisKey, '1', 'EX', secondsUntilEndDay);
    }

    async recordActivity(userId: string): Promise<{
        streakUpdated: boolean;
        oldStreak: number;
        newStreak: number;
        isMilestone: boolean;
    }> {
        const today = this.getToday();
        const yesterday = this.getYesterday();

        let gamification = await this.profilesRepository.findByUserId(userId);

        if (!gamification) {
            gamification = await this.profilesRepository.upsert(userId, {}, {});
        }

        if (gamification.lastActiveDate === today) {
            return {
                streakUpdated: false,
                oldStreak: gamification.currentStreak,
                newStreak: gamification.currentStreak,
                isMilestone: false,
            };
        }

        const oldStreak = gamification.currentStreak;
        let newStreak = gamification.currentStreak;
        let freezeCount = gamification.freezeCount;
        let freezeUsed = false;

        if (!gamification.lastActiveDate) {
            newStreak = 1;
        } else if (gamification.lastActiveDate === yesterday) {
            newStreak = gamification.currentStreak + 1;
        } else {
            const daysMissed = this.getDaysDifference(gamification.lastActiveDate, today);
            if (daysMissed === 2 && freezeCount > 0) {
                freezeCount -= 1;
                newStreak = gamification.currentStreak + 1;
                freezeUsed = true;
            } else {
                newStreak = 1;
            }
        }

        const longestStreak = Math.max(gamification.longestStreak, newStreak);
        const milestones = [3, 7, 14, 30, 50, 100, 365];
        const isMilestone = milestones.includes(newStreak);

        await this.prisma.$transaction(async (tx) => {
            const lastActiveDate = gamification.lastActiveDate;
            await tx.userGamification.update({
                where: { userId },
                data: {
                    currentStreak: newStreak,
                    longestStreak,
                    lastActiveDate: today,
                    freezeCount,
                    totalActiveDays: { increment: 1 },
                    weeklyActiveCount: lastActiveDate && this.isThisWeek(lastActiveDate)
                        ? { increment: 1 }
                        : 1,
                    monthlyActiveCount: lastActiveDate && this.isThisMonth(lastActiveDate)
                        ? { increment: 1 }
                        : 1,
                },
            });

            if (freezeUsed) {
                await tx.gamificationHistory.create({
                    data: {
                        userId,
                        amount: 0,
                        type: GamificationTransactionType.OTHER as any,
                        description: 'Đã sử dụng 1 bùa bảo vệ chuỗi (Tự động)',
                        metadata: { reason: 'STREAK_FREEZE_USED', streak: oldStreak }
                    }
                });
            }
        });

        return {
            streakUpdated: true,
            oldStreak,
            newStreak,
            isMilestone,
        };
    }

    async grantFreeze(userId: string, amount: number): Promise<void> {
        await this.profilesRepository.upsert(
            userId,
            { freezeCount: { increment: amount } },
            {}
        );
    }

    async checkStreaksDaily(): Promise<void> {
        const yesterday = this.getYesterday();
        const twoDaysAgo = this.getDaysAgo(2);

        const usersAtRisk = await this.profilesRepository.findUsersAtRiskOfStreakReset(twoDaysAgo);

        for (const gamification of usersAtRisk) {
            if (gamification.freezeCount > 0) {
                await this.prisma.$transaction([
                    this.prisma.userGamification.update({
                        where: { id: gamification.id },
                        data: {
                            freezeCount: { decrement: 1 },
                            lastActiveDate: yesterday,
                        },
                    }),
                    this.prisma.gamificationHistory.create({
                        data: {
                            userId: gamification.userId,
                            amount: 0,
                            type: GamificationTransactionType.OTHER as any,
                            description: 'Đã sử dụng bùa bảo vệ chuỗi (Hệ thống)',
                            metadata: { reason: 'AUTO_STREAK_FREEZE', date: yesterday }
                        }
                    })
                ]);
            } else {
                await this.profilesRepository.update(gamification.userId, { currentStreak: 0 });
            }
        }
    }

    async updateXP(userId: string, xpGain: number, activityType?: string): Promise<any> {
        try {
            let gamification = await this.profilesRepository.upsert(
                userId,
                {
                    totalXp: { increment: xpGain },
                    currentXp: { increment: xpGain },
                    points: { increment: xpGain },
                },
                {
                    totalXp: xpGain,
                    level: 1,
                    currentXp: xpGain,
                    points: xpGain,
                }
            );

            await this.prisma.gamificationHistory.create({
                data: {
                    userId,
                    amount: xpGain,
                    type: GamificationTransactionType.EARN as any,
                    activityType: activityType as any,
                    description: `Earned ${xpGain} points from ${activityType || 'activity'}`,
                }
            });

            const totalXp = gamification.totalXp;
            const newLevel = Math.floor(Math.sqrt(totalXp / 100)) + 1;

            if (newLevel > gamification.level) {
                const xpForCurrentLevel = Math.pow(newLevel - 1, 2) * 100;
                const currentXp = totalXp - xpForCurrentLevel;

                gamification = await this.profilesRepository.update(userId, {
                    level: newLevel,
                    currentXp: currentXp
                });

                this.natsClient.emit('user.level_up', { userId, level: newLevel, xp: totalXp });
            }

            this.natsClient.emit('user.xp_gained', { userId, xpGained: xpGain, totalXp: totalXp });

            return gamification;
        } catch (error) {
            this.logger.error(`Failed to update XP for user ${userId}`, error.stack);
            return null;
        }
    }

    // Helper Methods
    private getToday(): string { return new Date().toISOString().split('T')[0]; }
    private getYesterday(): string {
        const date = new Date();
        date.setUTCDate(date.getUTCDate() - 1);
        return date.toISOString().split('T')[0];
    }
    private getDaysAgo(days: number): string {
        const date = new Date();
        date.setUTCDate(date.getUTCDate() - days);
        return date.toISOString().split('T')[0];
    }
    private parseDateToUtc(dateStr: string): Date {
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(Date.UTC(year, month - 1, day));
    }
    private getDaysDifference(dateStr1: string, dateStr2: string): number {
        const date1 = this.parseDateToUtc(dateStr1);
        const date2 = this.parseDateToUtc(dateStr2);
        const diffTime = Math.abs(date2.getTime() - date1.getTime());
        return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    }
    private isThisWeek(dateStr: string): boolean {
        const date = this.parseDateToUtc(dateStr);
        const now = new Date();
        const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
        const weekStart = new Date(todayUtc);
        weekStart.setUTCDate(todayUtc.getUTCDate() - todayUtc.getUTCDay());
        return date >= weekStart;
    }
    private isThisMonth(dateStr: string): boolean {
        const date = this.parseDateToUtc(dateStr);
        const now = new Date();
        return date.getUTCMonth() === now.getUTCMonth() && date.getUTCFullYear() === now.getUTCFullYear();
    }
}
