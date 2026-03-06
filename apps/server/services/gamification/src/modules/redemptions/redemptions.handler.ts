import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { REDEMPTIONS_SERVICE_TOKEN } from '@server/gamification/interfaces/services';
import type { IRedemptionsService } from '@server/gamification/interfaces/services';

@Controller()
export class RedemptionsHandler {
  constructor(
    @Inject(REDEMPTIONS_SERVICE_TOKEN)
    private readonly redemptionsService: IRedemptionsService,
  ) {}

  // Alias kept for backward compatibility with older clients
  @MessagePattern({ cmd: 'gamification.getAvailableRewards' })
  async getAvailableRewardsLegacy() {
    return this.redemptionsService.getAvailableRewards();
  }

  @MessagePattern({ cmd: 'gamification.reward.findAll' })
  async getAvailableRewards() {
    return this.redemptionsService.getAvailableRewards();
  }

  @MessagePattern({ cmd: 'gamification.reward.history' })
  async getUserRedemptionHistory(@Payload() data: { userId: string }) {
    return this.redemptionsService.getUserRedemptionHistory(data.userId);
  }

  // Alias kept for backward compatibility with older clients
  @MessagePattern({ cmd: 'gamification.redeemPoints' })
  async redeemPointsLegacy(
    @Payload() data: { userId: string; rewardId?: string; dealId?: string },
  ) {
    const targetId = data.rewardId || data.dealId;
    if (!targetId) throw new Error('Reward ID or Deal ID is required');
    return this.redemptionsService.redeemReward(data.userId, targetId);
  }

  @MessagePattern({ cmd: 'gamification.reward.redeem' })
  async redeemReward(
    @Payload() data: { userId: string; rewardId?: string; dealId?: string },
  ) {
    const targetId = data.rewardId || data.dealId;
    if (!targetId) throw new Error('Reward ID or Deal ID is required');
    return this.redemptionsService.redeemReward(data.userId, targetId);
  }

  @MessagePattern({ cmd: 'gamification.reward.create' })
  async createReward(@Payload() data: any) {
    return this.redemptionsService.createReward(data);
  }

  @MessagePattern({ cmd: 'gamification.reward.update' })
  async updateReward(@Payload() data: { id: string; [key: string]: any }) {
    const { id, ...rest } = data;
    return this.redemptionsService.updateReward(id, rest);
  }

  @MessagePattern({ cmd: 'gamification.reward.delete' })
  async deleteReward(@Payload() data: { id: string }) {
    return this.redemptionsService.deleteReward(data.id);
  }
}
