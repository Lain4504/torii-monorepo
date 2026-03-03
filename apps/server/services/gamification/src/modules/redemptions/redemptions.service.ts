import { Injectable, Logger, Inject, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { IRedemptionsService } from '@server/gamification/interfaces/services';
import type { IRedemptionsRepository } from '@server/gamification/interfaces/repositories';
import { REDEMPTIONS_REPOSITORY_TOKEN } from '@server/gamification/interfaces/repositories';
import { PROFILES_SERVICE_TOKEN } from '@server/gamification/interfaces/services';
import type { IProfilesService } from '@server/gamification/interfaces/services';
import { GamificationTransactionType } from '@prisma/generated';

@Injectable()
export class RedemptionsService implements IRedemptionsService {
    private readonly logger = new Logger(RedemptionsService.name);

    constructor(
        @Inject(REDEMPTIONS_REPOSITORY_TOKEN) private readonly redemptionsRepository: IRedemptionsRepository,
        @Inject(PROFILES_SERVICE_TOKEN) private readonly profilesService: IProfilesService,
        private readonly prisma: PrismaService,
    ) { }

    async getAvailableRewards() {
        return this.redemptionsRepository.findAllRewards();
    }

    async getUserRedemptionHistory(userId: string) {
        return this.redemptionsRepository.findUserHistory(userId);
    }

    async redeemReward(userId: string, rewardId: string) {
        const reward = await this.redemptionsRepository.findRewardById(rewardId);
        if (!reward || !reward.isActive) {
            throw new NotFoundException('Reward not found or inactive');
        }

        const profile = await this.profilesService.getGamificationProfile(userId);
        if (profile.points < reward.points) {
            throw new BadRequestException('Not enough points');
        }

        return this.prisma.$transaction(async (tx) => {
            // Deduct points
            await tx.userGamification.update({
                where: { userId },
                data: {
                    points: { decrement: reward.points }
                }
            });

            // Create history
            const history = await tx.gamificationHistory.create({
                data: {
                    userId,
                    amount: -reward.points,
                    type: GamificationTransactionType.REDEEM as any,
                    description: `Đổi phần thưởng: ${reward.name}`,
                    metadata: { rewardId, rewardCode: (reward as any).code }
                }
            });

            // Apply reward specific logic (e.g., grant freeze, grant gems, etc.)
            const rewardMeta = reward.metadata as any;
            if (rewardMeta?.type === 'STREAK_FREEZE') {
                await tx.userGamification.update({
                    where: { userId },
                    data: {
                        freezeCount: { increment: rewardMeta.amount || 1 }
                    }
                });
            }

            return history;
        });
    }
}
