import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { ClientProxy } from '@nestjs/microservices';
import {
    UserAchievementDto,
    AchievementUnlockedEvent,
} from '@workspace/schemas';

@Injectable()
export class AchievementService {
    private readonly logger = new Logger(AchievementService.name);

    constructor(
        private readonly prisma: PrismaService,
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    /**
     * Get all achievements with user progress
     */
    async getUserAchievements(userId: string): Promise<UserAchievementDto[]> {
        const userAchievements = await this.prisma.userAchievement.findMany({
            where: { userId },
            include: {
                achievement: true,
            },
            orderBy: {
                achievement: {
                    orderIndex: 'asc',
                },
            },
        });

        return userAchievements.map(ua => ({
            id: ua.id,
            achievementId: ua.achievementId,
            isUnlocked: ua.isUnlocked,
            progress: ua.progress as Record<string, any> | null,
            unlockedAt: ua.unlockedAt?.toISOString() || null,
            achievement: {
                id: ua.achievement.id,
                code: ua.achievement.code,
                category: ua.achievement.category as any,
                title: ua.achievement.title,
                description: ua.achievement.description,
                icon: ua.achievement.icon,
                requirements: ua.achievement.requirements as Record<string, any>,
                rewards: ua.achievement.rewards as Record<string, any>,
                isActive: ua.achievement.isActive,
                orderIndex: ua.achievement.orderIndex,
            },
        }));
    }

    /**
     * Check and unlock achievements based on streak milestones
     */
    async checkStreakAchievements(
        userId: string,
        currentStreak: number,
    ): Promise<void> {
        const streakMilestones = [
            { streak: 3, code: 'STREAK_3' },
            { streak: 7, code: 'STREAK_7' },
            { streak: 14, code: 'STREAK_14' },
            { streak: 30, code: 'STREAK_30' },
            { streak: 100, code: 'STREAK_100' },
        ];

        for (const milestone of streakMilestones) {
            if (currentStreak >= milestone.streak) {
                await this.unlockAchievement(userId, milestone.code);
            }
        }
    }

    /**
     * Unlock achievement for user
     */
    async unlockAchievement(
        userId: string,
        achievementCode: string,
    ): Promise<void> {
        // Find achievement
        const achievement = await this.prisma.achievement.findUnique({
            where: { code: achievementCode },
        });

        if (!achievement || !achievement.isActive) {
            return;
        }

        // Check if already unlocked
        const existing = await this.prisma.userAchievement.findUnique({
            where: {
                userId_achievementId: {
                    userId,
                    achievementId: achievement.id,
                },
            },
        });

        if (existing?.isUnlocked) {
            return; // Already unlocked
        }

        // Unlock achievement
        await this.prisma.userAchievement.upsert({
            where: {
                userId_achievementId: {
                    userId,
                    achievementId: achievement.id,
                },
            },
            update: {
                isUnlocked: true,
                unlockedAt: new Date(),
            },
            create: {
                userId,
                achievementId: achievement.id,
                isUnlocked: true,
                unlockedAt: new Date(),
            },
        });

        this.logger.log(`User ${userId} unlocked achievement: ${achievementCode}`);

        // Apply rewards
        await this.applyRewards(userId, achievement.rewards as Record<string, any>);

        // Emit event for notification
        const event: AchievementUnlockedEvent = {
            userId,
            achievementId: achievement.id,
            achievementCode: achievement.code,
            achievementTitle: achievement.title,
            rewards: achievement.rewards as Record<string, any>,
            timestamp: new Date().toISOString(),
        };

        this.natsClient.emit('achievement.unlocked', event);
    }

    /**
     * Apply achievement rewards to user
     */
    private async applyRewards(
        userId: string,
        rewards: Record<string, any>,
    ): Promise<void> {
        // Grant freeze count
        if (rewards.freezeCount && typeof rewards.freezeCount === 'number') {
            await this.prisma.userStreak.upsert({
                where: { userId },
                update: {
                    freezeCount: { increment: rewards.freezeCount },
                },
                create: {
                    userId,
                    freezeCount: rewards.freezeCount,
                },
            });
        }

        // Other rewards can be implemented here (XP, badges, etc.)
    }
}
