import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { StreakStatusDto } from '@workspace/schemas';
import { ActivityService } from './activity.service';

@Injectable()
export class StreakService {
    private readonly logger = new Logger(StreakService.name);

    constructor(
        private readonly prisma: PrismaService,
        @Inject(forwardRef(() => ActivityService))
        private readonly activityService: ActivityService,
    ) { }

    /**
     * Get user's current streak status
     */
    async getStreakStatus(userId: string): Promise<StreakStatusDto> {
        let streak = await this.prisma.userStreak.findUnique({
            where: { userId },
        });

        // Initialize if not exists
        if (!streak) {
            streak = await this.prisma.userStreak.create({
                data: { userId },
            });
        }

        const today = this.getToday();
        const isActiveToday = streak.lastActiveDate === today;
        const yesterday = this.getYesterday();
        const willBreakTomorrow = !isActiveToday && streak.lastActiveDate !== yesterday;

        // Logic: Show toast if active today BUT haven't shown toast today yet
        const shouldShowToast = isActiveToday && streak.lastToastShownDate !== today;

        // Fetch recent active dates (last 7 days) using ActivityService
        const recentActiveDates = await this.activityService.getWeeklyActiveDates(userId, 7);

        return {
            currentStreak: streak.currentStreak,
            longestStreak: streak.longestStreak,
            freezeCount: streak.freezeCount,
            isActiveToday,
            willBreakTomorrow,
            lastActiveDate: streak.lastActiveDate,
            lastToastShownDate: streak.lastToastShownDate,
            totalActiveDays: streak.totalActiveDays,
            weeklyActiveCount: streak.weeklyActiveCount,
            monthlyActiveCount: streak.monthlyActiveCount,
            recentActiveDates,
            shouldShowToast,
        };
    }

    /**
     * Mark streak toast as shown for today
     */
    async markStreakToastShown(userId: string): Promise<void> {
        const today = this.getToday();
        await this.prisma.userStreak.update({
            where: { userId },
            data: {
                lastToastShownDate: today
            }
        });
        this.logger.log(`Marked streak toast as shown for user ${userId} on ${today}`);
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

        let streak = await this.prisma.userStreak.findUnique({
            where: { userId },
        });

        // Initialize if not exists
        if (!streak) {
            streak = await this.prisma.userStreak.create({
                data: { userId },
            });
        }

        // Already active today - no streak change
        if (streak.lastActiveDate === today) {
            return {
                streakUpdated: false,
                oldStreak: streak.currentStreak,
                newStreak: streak.currentStreak,
                isMilestone: false,
            };
        }

        const oldStreak = streak.currentStreak;
        let newStreak = streak.currentStreak;
        let freezeCount = streak.freezeCount;

        // Calculate streak
        if (!streak.lastActiveDate) {
            // First-time activity (no previous lastActiveDate) - start streak at 1
            newStreak = 1;
        } else if (streak.lastActiveDate === yesterday) {
            // Continue streak from yesterday
            newStreak = streak.currentStreak + 1;
        } else {
            // Missed day(s) - check freeze
            const daysMissed = this.getDaysDifference(streak.lastActiveDate, today);

            if (daysMissed === 2 && freezeCount > 0) {
                // Use freeze for 2-day gap (missed yesterday)
                freezeCount -= 1;
                // Streak continues: increment to account for today's activity
                newStreak = streak.currentStreak + 1;
                this.logger.log(`User ${userId} used a freeze. Remaining: ${freezeCount}`);
            } else {
                // Reset streak
                newStreak = 1;
                this.logger.log(`User ${userId} streak reset. Days missed: ${daysMissed}`);
            }
        }

        // Update longest streak
        const longestStreak = Math.max(streak.longestStreak, newStreak);

        // Check if milestone (3, 7, 14, 30, 100, etc.)
        const milestones = [3, 7, 14, 30, 50, 100, 365];
        const isMilestone = milestones.includes(newStreak);

        // Update database
        await this.prisma.userStreak.update({
            where: { userId },
            data: {
                currentStreak: newStreak,
                longestStreak,
                lastActiveDate: today,
                freezeCount,
                totalActiveDays: { increment: 1 },
                weeklyActiveCount: streak.lastActiveDate && this.isThisWeek(streak.lastActiveDate)
                    ? { increment: 1 }
                    : 1,
                monthlyActiveCount: streak.lastActiveDate && this.isThisMonth(streak.lastActiveDate)
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
        await this.prisma.userStreak.upsert({
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
        const usersAtRisk = await this.prisma.userStreak.findMany({
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

        for (const streak of usersAtRisk) {
            if (streak.freezeCount > 0) {
                // Use freeze
                await this.prisma.userStreak.update({
                    where: { id: streak.id },
                    data: {
                        freezeCount: { decrement: 1 },
                    },
                });
                this.logger.log(`Auto-used freeze for user ${streak.userId}`);
            } else {
                // Reset streak
                await this.prisma.userStreak.update({
                    where: { id: streak.id },
                    data: {
                        currentStreak: 0,
                    },
                });
                this.logger.log(`Reset streak for user ${streak.userId}`);
            }
        }
    }

    // ========================================
    // Helper Methods
    // ========================================

    private getToday(): string {
        return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
    }

    private getYesterday(): string {
        const date = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
        date.setDate(date.getDate() - 1);
        return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
    }

    private getDaysAgo(days: number): string {
        const date = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
        date.setDate(date.getDate() - days);
        return date.toLocaleDateString('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' });
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
