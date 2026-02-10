import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService, REDIS_CLIENT } from '@server/shared';
import Redis from 'ioredis';
import {
    StreakStatusDto,
    RecordActivityDto,
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

        // Fetch actual coin balance from userCoins table
        const userCoin = await this.prisma.userCoin.findUnique({
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
            coinBalance: userCoin?.balance || 0,
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

        // Calculate streak
        if (!gamification.lastActiveDate) {
            // First-time activity (no previous lastActiveDate) - start streak at 1
            newStreak = 1;
        } else if (gamification.lastActiveDate === yesterday) {
            // Continue streak from yesterday
            newStreak = gamification.currentStreak + 1;
        } else {
            // Missed day(s) - check freeze
            const daysMissed = this.getDaysDifference(gamification.lastActiveDate, today);

            if (daysMissed === 2 && freezeCount > 0) {
                // Use freeze for 2-day gap (missed yesterday)
                freezeCount -= 1;
                // Streak continues: increment to account for today's activity
                newStreak = gamification.currentStreak + 1;
                this.logger.log(`User ${userId} used a freeze. Remaining: ${freezeCount}`);
            } else {
                // Reset streak
                newStreak = 1;
                this.logger.log(`User ${userId} streak reset. Days missed: ${daysMissed}`);
            }
        }

        // Update longest streak
        const longestStreak = Math.max(gamification.longestStreak, newStreak);

        // Check if milestone (3, 7, 14, 30, 100, etc.)
        const milestones = [3, 7, 14, 30, 50, 100, 365];
        const isMilestone = milestones.includes(newStreak);

        // Update database
        await this.prisma.userGamification.update({
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

        // Find users who missed yesterday (and didn't miss day before that)
        const usersAtRisk = await this.prisma.userGamification.findMany({
            where: {
                lastActiveDate: {
                    lt: yesterday,
                    gte: twoDaysAgo,
                },
                currentStreak: {
                    gt: 0,
                },
            },
        });

        for (const gamification of usersAtRisk) {
            if (gamification.freezeCount > 0) {
                // Use freeze
                await this.prisma.userGamification.update({
                    where: { id: gamification.id },
                    data: {
                        freezeCount: { decrement: 1 },
                    },
                });
                this.logger.log(`Auto-used freeze for user ${gamification.userId}`);
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
