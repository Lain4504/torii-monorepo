import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { ClientProxy } from '@nestjs/microservices';
import {
    ActivityType,
    StreakUpdatedEvent,
} from '@workspace/schemas';
import { StreakService } from './streak.service';
import { AchievementService } from './achievement.service';

const XP_REWARDS: Record<ActivityType, number> = {
    LESSON_COMPLETE: 50,
    QUIZ_ANSWER: 10,
    VIDEO_WATCH: 20,
    REVIEW: 15,
    PRACTICE: 15,
    FLASHCARD_REVIEW: 5,
    EXAM_COMPLETE: 100,
    POST_CREATE: 20,
    COMMENT_CREATE: 10,
    LOGIN: 10,
};

@Injectable()
export class ActivityService {
    private readonly logger = new Logger(ActivityService.name);

    constructor(
        private readonly prisma: PrismaService,
        @Inject(forwardRef(() => StreakService))
        private readonly streakService: StreakService,
        private readonly achievementService: AchievementService,
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    /**
     * Record user activity and update streak/achievements
     */
    async recordActivity(
        userId: string,
        activityType: ActivityType,
        meta?: Record<string, any>,
    ): Promise<{
        streakUpdated: boolean;
        currentStreak: number;
        achievementsUnlocked: string[];
    }> {
        const today = this.getToday();

        // Check if already logged today for this activity type
        const existing = await this.prisma.dailyActivity.findUnique({
            where: {
                userId_date_activityType: {
                    userId,
                    date: today,
                    activityType,
                },
            },
        });

        // Log the activity if not already logged today for this specific type
        if (!existing) {
            await this.prisma.dailyActivity.create({
                data: {
                    userId,
                    date: today,
                    activityType,
                    meta: meta || {},
                },
            });
            this.logger.log(`Recorded ${activityType} for user ${userId}`);
        } else {
            this.logger.log(`Activity ${activityType} already logged today for ${userId}, skipping log but updating XP`);
        }

        // Calculate XP gain
        let xpGain = XP_REWARDS[activityType] || 0;

        // Multiplier or conditional XP
        if (activityType === 'QUIZ_ANSWER' && meta?.isCorrect === false) {
            xpGain = 2; // Small XP for effort even if wrong
        }

        // Update User XP and Level
        if (xpGain > 0) {
            await this.updateXP(userId, xpGain);
        }

        // Update streak
        const streakResult = await this.streakService.recordActivity(userId);

        // Emit streak updated event if it changed
        if (streakResult.streakUpdated) {
            const event: StreakUpdatedEvent = {
                userId,
                oldStreak: streakResult.oldStreak,
                newStreak: streakResult.newStreak,
                isMilestone: streakResult.isMilestone,
                timestamp: new Date().toISOString(),
            };

            this.natsClient.emit('streak.updated', event);
        }

        // Check and unlock achievements
        const achievementsUnlocked: string[] = [];

        // Check streak achievements
        if (streakResult.isMilestone) {
            await this.achievementService.checkStreakAchievements(
                userId,
                streakResult.newStreak,
            );
        }

        // Check activity-specific achievements
        switch (activityType) {
            case 'LESSON_COMPLETE':
                await this.achievementService.checkLessonAchievements(userId);
                // Also check if course completed
                if (meta?.courseCompleted) {
                    await this.achievementService.checkCourseAchievements(userId);
                }
                break;

            case 'QUIZ_ANSWER':
                if (meta?.score && meta?.jlptLevel) {
                    await this.achievementService.checkQuizAchievements(
                        userId,
                        meta.score,
                        meta.jlptLevel,
                    );
                }
                break;

            case 'FLASHCARD_REVIEW':
                await this.achievementService.checkFlashcardAchievements(userId);
                break;
        }

        return {
            streakUpdated: streakResult.streakUpdated,
            currentStreak: streakResult.newStreak,
            achievementsUnlocked,
        };
    }

    /**
     * Get user's active dates for the last N days
     */
    async getWeeklyActiveDates(userId: string, days: number = 7): Promise<string[]> {
        const startDate = this.getDaysAgo(days);
        const activities = await this.prisma.dailyActivity.findMany({
            where: {
                userId,
                date: { gte: startDate },
            },
            select: { date: true },
            distinct: ['date'],
        });
        return activities.map((a) => a.date);
    }

    // ========================================
    // Helper Methods
    // ========================================

    private getToday(): string {
        return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    }

    private getDaysAgo(days: number): string {
        const date = new Date();
        date.setUTCDate(date.getUTCDate() - days);
        return date.toISOString().split('T')[0];
    }

    /**
     * Update user XP and level in UserStats
     */
    private async updateXP(userId: string, xpGain: number) {
        try {
            // Use an upsert for UserStats to be safe, though it should exist from user creation
            const stats = await this.prisma.userStats.upsert({
                where: { userId },
                create: {
                    userId,
                    xp: xpGain,
                    level: Math.floor(Math.sqrt(xpGain / 100)) + 1
                },
                update: {
                    xp: { increment: xpGain }
                }
            });

            this.logger.log(`Updated XP for user ${userId}: +${xpGain} XP (New total: ${stats.xp})`);

            const newXp = stats.xp;
            const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;

            if (newLevel > stats.level) {
                await this.prisma.userStats.update({
                    where: { userId },
                    data: { level: newLevel }
                });

                // Emit level up event
                this.natsClient.emit('user.level_up', { userId, level: newLevel, xp: newXp });
                this.logger.log(`User ${userId} leveled up to ${newLevel}`);
            }

            // Emit XP gained event for UI updates
            this.natsClient.emit('user.xp_gained', { userId, xpGained: xpGain, totalXp: newXp });
        } catch (error) {
            this.logger.error(`Failed to update XP for user ${userId}`, error.stack);
        }
    }
}
