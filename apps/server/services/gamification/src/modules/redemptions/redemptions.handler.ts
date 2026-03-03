import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { REDEMPTIONS_SERVICE_TOKEN } from '@server/gamification/interfaces/services';
import type { IRedemptionsService } from '@server/gamification/interfaces/services';

@Controller()
export class RedemptionsHandler {
    constructor(
        @Inject(REDEMPTIONS_SERVICE_TOKEN) private readonly redemptionsService: IRedemptionsService
    ) { }

    @MessagePattern({ cmd: 'gamification.getAvailableRewards' })
    @MessagePattern({ cmd: 'gamification.reward.findAll' })
    async getAvailableRewards() {
        return this.redemptionsService.getAvailableRewards();
    }

    @MessagePattern({ cmd: 'gamification.reward.history' })
    async getUserRedemptionHistory(@Payload() data: { userId: string }) {
        return this.redemptionsService.getUserRedemptionHistory(data.userId);
    }

    @MessagePattern({ cmd: 'gamification.redeemPoints' })
    @MessagePattern({ cmd: 'gamification.reward.redeem' })
    async redeemReward(@Payload() data: { userId: string, rewardId?: string, dealId?: string }) {
        const targetId = data.rewardId || data.dealId;
        if (!targetId) throw new Error('Reward ID or Deal ID is required');
        return this.redemptionsService.redeemReward(data.userId, targetId);
    }
}
