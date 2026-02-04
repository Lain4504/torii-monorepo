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
     * Update user XP and level in UserGamification
     */
    private async updateXP(userId: string, xpGain: number) {
        try {
            // Use an upsert for UserGamification to be safe
            const gamification = await this.prisma.userGamification.upsert({
                where: { userId },
                create: {
                    userId,
                    totalXp: xpGain,
                    level: 1,
                    currentXp: xpGain, // Initial XP
                },
                update: {
                    totalXp: { increment: xpGain },
                    currentXp: { increment: xpGain },
                }
            });

            this.logger.log(`Updated XP for user ${userId}: +${xpGain} XP (New total: ${gamification.totalXp})`);

            const totalXp = gamification.totalXp;
            const newLevel = Math.floor(Math.sqrt(totalXp / 100)) + 1;

            if (newLevel > gamification.level) {
                // Level up logic
                // Calculate currentXp (progressive XP in the new level)
                const xpForCurrentLevel = Math.pow(newLevel - 1, 2) * 100;
                const currentXp = totalXp - xpForCurrentLevel;

                await this.prisma.userGamification.update({
                    where: { userId },
                    data: {
                        level: newLevel,
                        currentXp: currentXp
                    }
                });

                // Emit level up event
                this.natsClient.emit('user.level_up', { userId, level: newLevel, xp: totalXp });
                this.logger.log(`User ${userId} leveled up to ${newLevel}`);
            }

            // Emit XP gained event for UI updates
            this.natsClient.emit('user.xp_gained', { userId, xpGained: xpGain, totalXp: totalXp });
        } catch (error) {
            this.logger.error(`Failed to update XP for user ${userId}`, error.stack);
        }
    }
}
