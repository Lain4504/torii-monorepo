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

        if (existing) {
            // Already logged - just return current streak
            const streakStatus = await this.streakService.getStreakStatus(userId);
            return {
                streakUpdated: false,
                currentStreak: streakStatus.currentStreak,
                achievementsUnlocked: [],
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

        return {
            streakUpdated: streakResult.streakUpdated,
            currentStreak: streakResult.newStreak,
            achievementsUnlocked,
        };
    }

    // ========================================
    // Helper Methods
    // ========================================

    private getToday(): string {
        return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    }
}
