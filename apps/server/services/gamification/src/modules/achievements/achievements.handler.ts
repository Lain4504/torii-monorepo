import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ACHIEVEMENTS_SERVICE_TOKEN } from '@server/gamification/interfaces/services';
import type { IAchievementsService } from '@server/gamification/interfaces/services';

@Controller()
export class AchievementsHandler {
    constructor(
        @Inject(ACHIEVEMENTS_SERVICE_TOKEN) private readonly achievementsService: IAchievementsService
    ) { }

    // Legacy alias
    @MessagePattern({ cmd: 'gamification.getAchievements' })
    async getUserAchievementsLegacy(@Payload() data: { userId: string }) {
        return this.achievementsService.getUserAchievements(data.userId);
    }

    @MessagePattern({ cmd: 'gamification.achievement.findAll' })
    async getUserAchievements(@Payload() data: { userId: string }) {
        return this.achievementsService.getUserAchievements(data.userId);
    }

    @MessagePattern({ cmd: 'gamification.achievement.unlock' })
    async unlockAchievement(@Payload() data: { userId: string, code: string }) {
        await this.achievementsService.unlockAchievement(data.userId, data.code);
        return { success: true };
    }
}
