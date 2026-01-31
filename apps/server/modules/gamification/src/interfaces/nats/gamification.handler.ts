import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
    RecordActivityDto,
    GrantFreezeDto,
    StreakStatusDto,
    UserAchievementDto,
} from '@workspace/schemas';
import { StreakService } from '../../services/streak.service';
import { AchievementService } from '../../services/achievement.service';
import { ActivityService } from '../../services/activity.service';

@Controller()
export class GamificationHandler {
    private readonly logger = new Logger(GamificationHandler.name);

    constructor(
        private readonly streakService: StreakService,
        private readonly achievementService: AchievementService,
        private readonly activityService: ActivityService,
    ) { }

    /**
     * Get user's streak status
     */
    @MessagePattern('gamification.getStreak')
    async getStreak(@Payload() data: { userId: string }): Promise<StreakStatusDto> {
        this.logger.log(`Getting streak for user: ${data.userId}`);
        return this.streakService.getStreakStatus(data.userId);
    }

    /**
     * Record user activity (manually triggered, not via event)
     */
    @MessagePattern('gamification.recordActivity')
    async recordActivity(@Payload() data: { userId: string } & RecordActivityDto) {
        this.logger.log(`Recording activity for user: ${data.userId}, type: ${data.activityType}`);
        return this.activityService.recordActivity(
            data.userId,
            data.activityType,
            data.meta,
        );
    }

    /**
     * Get user's achievements
     */
    @MessagePattern('gamification.getAchievements')
    async getAchievements(@Payload() data: { userId: string }): Promise<UserAchievementDto[]> {
        this.logger.log(`Getting achievements for user: ${data.userId}`);
        return this.achievementService.getUserAchievements(data.userId);
    }

    /**
     * Grant freeze count to user (admin/system action)
     */
    @MessagePattern('gamification.grantFreeze')
    async grantFreeze(@Payload() data: { userId: string } & GrantFreezeDto) {
        this.logger.log(`Granting ${data.amount} freeze(s) to user: ${data.userId}`);
        await this.streakService.grantFreeze(data.userId, data.amount);
        return { success: true };
    }

    /**
     * Mark streak toast as shown for today
     */
    @MessagePattern('gamification.markStreakToastShown')
    async markStreakToastShown(@Payload() data: { userId: string }) {
        this.logger.log(`Marking streak toast as shown for user: ${data.userId}`);
        await this.streakService.markStreakToastShown(data.userId);
        return { success: true };
    }
}
