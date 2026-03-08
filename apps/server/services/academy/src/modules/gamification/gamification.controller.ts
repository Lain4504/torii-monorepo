import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { GamificationService } from './gamification.service';
import { AchievementService } from './achievement.service';
import { RpcException } from '@nestjs/microservices';

@Controller()
export class GamificationController {
    private readonly logger = new Logger(GamificationController.name);

    constructor(
        private readonly gamificationService: GamificationService,
        private readonly achievementService: AchievementService,
    ) { }

    @MessagePattern('gamification.getProfile')
    async getProfile(@Payload() data: { userId: string }) {
        try {
            return await this.gamificationService.getProfile(data.userId);
        } catch (error) {
            this.logger.error(`Error getting profile: ${error.message}`, error.stack);
            throw new RpcException(error.message);
        }
    }

    @MessagePattern('gamification.getHistory')
    async getHistory(@Payload() data: { userId: string, limit?: number, offset?: number }) {
        try {
            return await this.gamificationService.getHistory(data.userId, data.limit, data.offset);
        } catch (error) {
            this.logger.error(`Error getting history: ${error.message}`, error.stack);
            throw new RpcException(error.message);
        }
    }

    @MessagePattern('gamification.getAvailableRewards')
    async getRewards() {
        try {
            return await this.gamificationService.getRewards();
        } catch (error) {
            this.logger.error(`Error getting rewards: ${error.message}`, error.stack);
            throw new RpcException(error.message);
        }
    }

    @MessagePattern('gamification.redeemPoints')
    async redeemPoints(@Payload() data: { userId: string, dealId: string }) {
        try {
            return await this.gamificationService.redeemReward(data.userId, data.dealId);
        } catch (error) {
            this.logger.error(`Error redeeming points: ${error.message}`, error.stack);
            throw new RpcException(error.message);
        }
    }

    @MessagePattern('gamification.getStreak')
    async getStreak(@Payload() data: { userId: string }) {
        try {
            return await this.gamificationService.checkAndGetStreak(data.userId);
        } catch (error) {
            throw new RpcException(error.message);
        }
    }

    @MessagePattern('gamification.recordActivity')
    async recordActivity(@Payload() data: { userId: string, activityType: any, meta: any }) {
        try {
            return await this.gamificationService.trackActivity(data.userId, data.activityType, data.meta);
        } catch (error) {
            throw new RpcException(error.message);
        }
    }

    // --- Admin CRUD ---

    @MessagePattern('gamification.admin.getAllRewards')
    async admin_getAllRewards() {
        try {
            return await this.gamificationService.admin_getAllRewards();
        } catch (error) {
            throw new RpcException(error.message);
        }
    }

    @MessagePattern('gamification.admin.createReward')
    async admin_createReward(@Payload() data: any) {
        try {
            return await this.gamificationService.admin_createReward(data);
        } catch (error) {
            throw new RpcException(error.message);
        }
    }

    @MessagePattern('gamification.admin.updateReward')
    async admin_updateReward(@Payload() data: { id: string, data: any }) {
        try {
            return await this.gamificationService.admin_updateReward(data.id, data.data);
        } catch (error) {
            throw new RpcException(error.message);
        }
    }

    @MessagePattern('gamification.admin.deleteReward')
    async admin_deleteReward(@Payload() data: { id: string }) {
        try {
            return await this.gamificationService.admin_deleteReward(data.id);
        } catch (error) {
            throw new RpcException(error.message);
        }
    }

    // --- Achievement ---

    @MessagePattern('gamification.getAchievements')
    async getAchievements(@Payload() data: { userId: string }) {
        try {
            return await this.achievementService.getAchievementsForUser(data.userId);
        } catch (error) {
            this.logger.error(`Error getting achievements: ${error.message}`, error.stack);
            throw new RpcException(error.message);
        }
    }

    // --- Admin Achievement CRUD ---

    @MessagePattern('gamification.admin.getAllAchievements')
    async admin_getAllAchievements() {
        try {
            return await this.achievementService.admin_getAllAchievements();
        } catch (error) {
            throw new RpcException(error.message);
        }
    }

    @MessagePattern('gamification.admin.createAchievement')
    async admin_createAchievement(@Payload() data: any) {
        try {
            return await this.achievementService.admin_createAchievement(data);
        } catch (error) {
            throw new RpcException(error.message);
        }
    }

    @MessagePattern('gamification.admin.updateAchievement')
    async admin_updateAchievement(@Payload() data: { id: string, data: any }) {
        try {
            return await this.achievementService.admin_updateAchievement(data.id, data.data);
        } catch (error) {
            throw new RpcException(error.message);
        }
    }

    @MessagePattern('gamification.admin.deleteAchievement')
    async admin_deleteAchievement(@Payload() data: { id: string }) {
        try {
            return await this.achievementService.admin_deleteAchievement(data.id);
        } catch (error) {
            throw new RpcException(error.message);
        }
    }

    @MessagePattern('gamification.getActivityHeatmap')
    async getActivityHeatmap(@Payload() data: { userId: string, startDate?: string, endDate?: string }) {
        try {
            return await this.gamificationService.getActivityHeatmap(data.userId, data.startDate, data.endDate);
        } catch (error) {
            this.logger.error(`Error getting activity heatmap: ${error.message}`, error.stack);
            throw new RpcException(error.message);
        }
    }
}
