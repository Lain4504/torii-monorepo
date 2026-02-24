import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService, REDIS_CLIENT } from '@server/shared';
import Redis from 'ioredis';
import {
    StreakStatusDto,
    UserGamificationDto,
} from '@workspace/schemas';
import { ActivityService } from '@server/gamification/services';

@Injectable()
export class StreakService {
    private readonly logger = new Logger(StreakService.name);

    constructor(
        private readonly prisma: PrismaService,
        @Inject(forwardRef(() => ActivityService))
        private readonly activityService: ActivityService,
        @Inject(REDIS_CLIENT)
        private readonly redis: Redis,
    ) { }

    /**
     * Get user's current streak status
     */
    /**
     * Get user's full gamification profile
     */
    async getGamificationProfile(userId: string): Promise<UserGamificationDto> {
        let gamification = await this.prisma.userGamification.findUnique({
            where: { userId },
        });

        if (!gamification) {
            gamification = await this.prisma.userGamification.create({
                data: { userId },
            });
        }

        // Fetch actual balance from userBalances table
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
        let gamification = await this.prisma.userGamification.findUnique({
            where: { userId },
        });

        // Initialize if not exists
        if (!gamification) {
            gamification = await this.prisma.userGamification.create({
                data: { userId },
            });
        }

        const today = this.getToday();
        const isActiveToday = gamification.lastActiveDate === today;
        const yesterday = this.getYesterday();
        const willBreakTomorrow = !isActiveToday && gamification.lastActiveDate !== yesterday;

        // Logic: Show toast if active today BUT haven't shown toast today yet
        // Check Redis for the toast flag
        const redisKey = `streak_toast:${userId}:${today}`;
        const toastShownToday = await this.redis.get(redisKey);
        const shouldShowToast = isActiveToday && !toastShownToday;

        // Fetch recent active dates (last 7 days) using ActivityService
        const recentActiveDates = await this.activityService.getWeeklyActiveDates(userId, 7);

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

    /**
     * Mark streak toast as shown for today
     */
    async markStreakToastShown(userId: string): Promise<void> {
        const today = this.getToday();
        const redisKey = `streak_toast:${userId}:${today}`;

        // Calculate seconds until end of day (UTC midnight)
        const now = new Date();
        const endOfDay = new Date(now);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const secondsUntilEndDay = Math.max(1, Math.floor((endOfDay.getTime() - now.getTime()) / 1000));

        // Set flag in Redis with TTL until end of day (UTC)
        await this.redis.set(redisKey, '1', 'EX', secondsUntilEndDay);

        this.logger.log(`Marked streak toast as shown for user ${userId} on ${today} (UTC TTL: ${secondsUntilEndDay}s)`);
    }

    /**
     * Record activity and update streak
     * Returns { streakUpdated: boolean, newStreak: number, isMilestone: boolean }
     */
    /**
     * Record activity and update streak
     * Returns { streakUpdated: boolean, newStreak: number, isMilestone: boolean }
     */
    async recordActivity(userId: string): Promise<{
        streakUpdated: boolean;
        oldStreak: number;
        newStreak: number;
        isMilestone: boolean;
    }> {
        const today = this.getToday();
        const yesterday = this.getYesterday();

        let gamification = await this.prisma.userGamification.findUnique({
            where: { userId },
        });

        // Initialize if not exists
        if (!gamification) {
            gamification = await this.prisma.userGamification.create({
                data: { userId },
            });
        }

        // Already active today - no streak change
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

        // Calculate streak
        if (!gamification.lastActiveDate) {
            // First-time activity: start streak at 1
            newStreak = 1;
        } else if (gamification.lastActiveDate === yesterday) {
            // Continue streak from yesterday
            newStreak = gamification.currentStreak + 1;
        } else {
            // Missed day(s) - check if we can save it with a freeze
            const daysMissed = this.getDaysDifference(gamification.lastActiveDate, today);

            // If we missed exactly 1 day (yesterday) and have a freeze
            // Note: daysMissed = 2 means Sunday was last active, today is Tuesday.
            if (daysMissed === 2 && freezeCount > 0) {
                freezeCount -= 1;
                newStreak = gamification.currentStreak + 1;
                freezeUsed = true;
                this.logger.log(`User ${userId} used a freeze during login. Remaining: ${freezeCount}`);
            } else {
                // Too many days missed or no freezes left
                newStreak = 1;
                this.logger.log(`User ${userId} streak reset. Days missed: ${daysMissed}`);
            }
        }

        // Update longest streak
        const longestStreak = Math.max(gamification.longestStreak, newStreak);

        // Check if milestone
        const milestones = [3, 7, 14, 30, 50, 100, 365];
        const isMilestone = milestones.includes(newStreak);

        // Update database and history if freeze used
        await this.prisma.$transaction(async (tx) => {
            await tx.userGamification.update({
                where: { userId },
                data: {
                    currentStreak: newStreak,
                    longestStreak,
                    lastActiveDate: today,
                    freezeCount,
                    totalActiveDays: { increment: 1 },
                    weeklyActiveCount: gamification.lastActiveDate && this.isThisWeek(gamification.lastActiveDate)
                        ? { increment: 1 }
                        : 1,
                    monthlyActiveCount: gamification.lastActiveDate && this.isThisMonth(gamification.lastActiveDate)
                        ? { increment: 1 }
                        : 1,
                },
            });

            if (freezeUsed) {
                await tx.gamificationHistory.create({
                    data: {
                        userId,
                        amount: 0,
                        type: 'OTHER' as any,
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

    /**
     * Grant freeze count to user (from achievement reward or purchase)
     */
    async grantFreeze(userId: string, amount: number): Promise<void> {
        await this.prisma.userGamification.upsert({
            where: { userId },
            update: {
                freezeCount: { increment: amount },
            },
            create: {
                userId,
                freezeCount: amount,
            },
        });

        this.logger.log(`Granted ${amount} freeze(s) to user ${userId}`);
    }

    /**
     * Daily job: Check and reset streaks for inactive users
     */
    async checkStreaksDaily(): Promise<void> {
        const yesterday = this.getYesterday();
        const twoDaysAgo = this.getDaysAgo(2);

        // Find users who were active 2 days ago but NOT yesterday
        const usersAtRisk = await this.prisma.userGamification.findMany({
            where: {
                lastActiveDate: {
                    equals: twoDaysAgo, // Last active was day before yesterday
                },
                currentStreak: {
                    gt: 0,
                },
            },
        });

        for (const gamification of usersAtRisk) {
            if (gamification.freezeCount > 0) {
                // 1. Proactively consume freeze
                // 2. IMPORTANT: Update lastActiveDate to yesterday so it bridges the gap
                await this.prisma.$transaction([
                    this.prisma.userGamification.update({
                        where: { id: gamification.id },
                        data: {
                            freezeCount: { decrement: 1 },
                            lastActiveDate: yesterday, // bridge the gap!
                        },
                    }),
                    this.prisma.gamificationHistory.create({
                        data: {
                            userId: gamification.userId,
                            amount: 0,
                            type: 'OTHER' as any,
                            description: 'Đã sử dụng bùa bảo vệ chuỗi (Hệ thống)',
                            metadata: { reason: 'AUTO_STREAK_FREEZE', date: yesterday }
                        }
                    })
                ]);
                this.logger.log(`Auto-used freeze for user ${gamification.userId} to protect streak for ${yesterday}`);
            } else {
                // Reset streak
                await this.prisma.userGamification.update({
                    where: { id: gamification.id },
                    data: {
                        currentStreak: 0,
                    },
                });
                this.logger.log(`Reset streak for user ${gamification.userId}`);
            }
        }
    }

    // ========================================
    // Helper Methods
    // ========================================

    private getToday(): string {
        return new Date().toISOString().split('T')[0]; // YYYY-MM-DD (UTC)
    }

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

        // Today's date at UTC midnight
        const now = new Date();
        const todayUtc = new Date(
            Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
        );

        const weekStart = new Date(todayUtc);
        weekStart.setUTCDate(todayUtc.getUTCDate() - todayUtc.getUTCDay());

        return date >= weekStart;
    }

    private isThisMonth(dateStr: string): boolean {
        const date = this.parseDateToUtc(dateStr);
        const now = new Date();
        const currentMonth = now.getUTCMonth();
        const currentYear = now.getUTCFullYear();

        return date.getUTCMonth() === currentMonth &&
            date.getUTCFullYear() === currentYear;
    }
}
