import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { ClientProxy } from '@nestjs/microservices';
import {
    ActivityType,
    StreakUpdatedEvent,
} from '@workspace/schemas';
import { StreakService } from './streak.service';
import { AchievementService } from './achievement.service';

@Injectable()
export class ActivityService {
    private readonly logger = new Logger(ActivityService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly streakService: StreakService,
        private readonly achievementService: AchievementService,
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    /**
     * Record user activity and update streak/achievements/XP/Coins
     */
    async recordActivity(
        userId: string,
        activityType: ActivityType,
        meta?: Record<string, any>,
    ): Promise<{
        streakUpdated: boolean;
        currentStreak: number;
        achievementsUnlocked: string[];
        xpEarned: number;
        coinsEarned: number;
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

        if (existing) {
            // Already logged - just return current streak
            const streakStatus = await this.streakService.getStreakStatus(userId);
            return {
                streakUpdated: false,
                currentStreak: streakStatus.currentStreak,
                achievementsUnlocked: [],
                xpEarned: 0,
                coinsEarned: 0,
            };
        }

        // Log the activity
        await this.prisma.dailyActivity.create({
            data: {
                userId,
                date: today,
                activityType,
                meta: meta || {},
            },
        });

        this.logger.log(`Recorded ${activityType} for user ${userId}`);

        // Calculate rewards
        const rewards = this.calculateRewards(activityType, meta);

        // Update user profile (XP, Coins)
        await this.prisma.user.update({
            where: { id: userId },
            data: {
                totalXp: { increment: rewards.xp },
                currentWeekXp: { increment: rewards.xp },
                coins: { increment: rewards.coins },
            },
        });

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

            // Reward for streak milestones (from spec: 7 days = 100 XP, 50 Coins)
            if (streakResult.newStreak === 7) {
                await this.prisma.user.update({
                    where: { id: userId },
                    data: {
                        totalXp: { increment: 100 },
                        currentWeekXp: { increment: 100 },
                        coins: { increment: 50 },
                    },
                });
            }
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
                if (meta?.courseCompleted) {
                    await this.achievementService.checkCourseAchievements(userId);
                }
                break;

            case 'QUIZ_ANSWER':
            case 'EXAM_COMPLETE':
                if (meta?.score !== undefined && meta?.jlptLevel) {
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
            xpEarned: rewards.xp,
            coinsEarned: rewards.coins,
        };
    }

    /**
     * Calculate XP and Coins based on activity type
     */
    private calculateRewards(
        activityType: ActivityType,
        meta?: Record<string, any>,
    ): { xp: number; coins: number } {
        switch (activityType) {
            case 'LOGIN':
                return { xp: 5, coins: 2 };
            case 'LESSON_COMPLETE':
                return { xp: 20, coins: 5 };
            case 'QUIZ_ANSWER':
                // Check if correct (meta.isCorrect)
                return meta?.isCorrect ? { xp: 2, coins: 0 } : { xp: 0, coins: 0 };
            case 'EXAM_COMPLETE':
                // Assume 100% pass for base reward, could be dynamic
                return { xp: 100, coins: 20 };
            case 'PRACTICE':
                return { xp: 10, coins: 3 };
            case 'FLASHCARD_REVIEW':
                return { xp: 15, coins: 4 };
            default:
                return { xp: 2, coins: 1 };
        }
    }

    // ========================================
    // Helper Methods
    // ========================================

    private getToday(): string {
        return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    }
}
