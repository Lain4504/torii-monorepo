import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { StreakStatusDto } from '@workspace/schemas';

@Injectable()
export class StreakService {
    private readonly logger = new Logger(StreakService.name);

    constructor(private readonly prisma: PrismaService) { }

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

        return {
            currentStreak: streak.currentStreak,
            longestStreak: streak.longestStreak,
            freezeCount: streak.freezeCount,
            isActiveToday,
            willBreakTomorrow,
            lastActiveDate: streak.lastActiveDate,
            totalActiveDays: streak.totalActiveDays,
            weeklyActiveCount: streak.weeklyActiveCount,
            monthlyActiveCount: streak.monthlyActiveCount,
        };
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
        if (!streak.lastActiveDate || streak.lastActiveDate === yesterday) {
            // Continue streak
            newStreak = streak.currentStreak + 1;
        } else {
            // Missed day(s) - check freeze
            const daysMissed = this.getDaysDifference(streak.lastActiveDate, today);

            if (daysMissed === 2 && freezeCount > 0) {
                // Use freeze for 1-day miss
                freezeCount -= 1;
                // Streak continues
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
                weeklyActiveCount: this.isThisWeek(today)
                    ? { increment: 1 }
                    : 1,
                monthlyActiveCount: this.isThisMonth(today)
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
        const today = this.getToday();
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
        return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    }

    private getYesterday(): string {
        const date = new Date();
        date.setDate(date.getDate() - 1);
        return date.toISOString().split('T')[0];
    }

    private getDaysAgo(days: number): string {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString().split('T')[0];
    }

    private getDaysDifference(dateStr1: string, dateStr2: string): number {
        const date1 = new Date(dateStr1);
        const date2 = new Date(dateStr2);
        const diffTime = Math.abs(date2.getTime() - date1.getTime());
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    private isThisWeek(dateStr: string): boolean {
        const date = new Date(dateStr);
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        return date >= weekStart;
    }

    private isThisMonth(dateStr: string): boolean {
        const date = new Date(dateStr);
        const now = new Date();
        return date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear();
    }
}
