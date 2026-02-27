import { Injectable, Logger, Inject, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { CouponDiscountType } from '@workspace/schemas';

@Injectable()
export class RedemptionService {
    private readonly logger = new Logger(RedemptionService.name);

    constructor(
        private readonly prisma: PrismaService,
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    /**
     * Redeem points for a reward
     */
    async redeemPoints(userId: string, rewardId: string) {
        const reward = await this.prisma.pointReward.findUnique({
            where: { id: rewardId, isActive: true }
        });

        if (!reward) {
            throw new BadRequestException('Invalid or inactive reward');
        }

        // Add validation to ensure the reward has a positive point cost
        if (reward.points <= 0) {
            this.logger.error(`Attempted to redeem a reward with non-positive points. Reward ID: ${rewardId}, Points: ${reward.points}`);
            throw new BadRequestException('This reward cannot be redeemed as it has an invalid point cost.');
        }

        const gamification = await this.prisma.userGamification.findUnique({
            where: { userId }
        });

        if (!gamification || gamification.points < reward.points) {
            throw new BadRequestException('Bạn không đủ điểm để đổi quà này');
        }

        // 1. Internal Reward Check (Duolingo-style)
        // If reward name contains 'Streak Freeze', it's an internal gamification item
        const isInternalReward = reward.name.toLowerCase().includes('streak freeze') ||
            reward.name.toLowerCase().includes('bùa bảo vệ chuỗi');

        if (isInternalReward) {
            // Deduct points and increment freezeCount
            await this.prisma.$transaction([
                this.prisma.userGamification.update({
                    where: { userId },
                    data: {
                        points: { decrement: reward.points },
                        freezeCount: { increment: 1 }
                    }
                }),
                this.prisma.gamificationHistory.create({
                    data: {
                        userId,
                        amount: -reward.points,
                        type: 'REDEEM' as any,
                        description: `Đã đổi ${reward.points} điểm lấy ${reward.name}`,
                        metadata: { rewardId, rewardName: reward.name, isInternal: true }
                    }
                })
            ]);

            this.logger.log(`User ${userId} redeemed points for internal reward: ${reward.name}`);

            return {
                success: true,
                pointsDeducted: reward.points,
                remainingPoints: gamification.points - reward.points,
                message: `Bạn đã nhận được 1 ${reward.name}!`,
                isInternal: true
            };
        }

        // 2. Billing-based Reward (Coupons)
        // Request Billing to create a personal coupon FIRST
        try {
            const coupon = await lastValueFrom(
                this.natsClient.send({ cmd: 'billing.coupon.createRedeemed' }, {
                    userId,
                    name: reward.name,
                    discountType: reward.discountType,
                    discountValue: Number(reward.discountValue),
                    validDurationDays: reward.validDuration || 30,
                    maxDiscountAmount: reward.maxDiscountAmount ? Number(reward.maxDiscountAmount) : null,
                    minOrderAmount: reward.minOrderAmount ? Number(reward.minOrderAmount) : null
                })
            );

            // 3. Atomically deduct points and log history
            await this.prisma.$transaction([
                this.prisma.userGamification.update({
                    where: { userId },
                    data: {
                        points: { decrement: reward.points }
                    }
                }),
                this.prisma.gamificationHistory.create({
                    data: {
                        userId,
                        amount: -reward.points,
                        type: 'REDEEM' as any,
                        description: `Đã đổi ${reward.points} điểm lấy mã giảm giá: ${reward.name}`,
                        metadata: { rewardId, couponCode: coupon.code }
                    }
                })
            ]);

            this.logger.log(`User ${userId} redeemed ${reward.points} points for coupon: ${reward.name} (Code: ${coupon.code})`);

            return {
                success: true,
                pointsDeducted: reward.points,
                remainingPoints: gamification.points - reward.points,
                couponCode: coupon.code,
                coupon
            };
        } catch (error: any) {
            this.logger.error(`Failed to complete point redemption for user ${userId}: ${error.message}`);
            // If it's a BadRequestException from Billing, rethrow it
            if (error instanceof BadRequestException) throw error;
            throw new BadRequestException(error.message || 'Đã có lỗi xảy ra khi đổi điểm. Vui lòng thử lại sau.');
        }
    }

    /**
     * Get available rewards for learners
     */
    async getAvailableRewards() {
        const rewards = await this.prisma.pointReward.findMany({
            where: { isActive: true },
            orderBy: { points: 'asc' }
        });

        return rewards.map(r => ({
            id: r.id,
            name: r.name,
            description: r.description,
            pointsContent: `${r.points.toLocaleString()} Points`,
            points: r.points,
            type: r.discountType === 'percentage' ? 'percentage' : 'fixed',
            discountValue: Number(r.discountValue),
            maxDiscountAmount: r.maxDiscountAmount ? Number(r.maxDiscountAmount) : null,
            minOrderAmount: r.minOrderAmount ? Number(r.minOrderAmount) : null,
            validDuration: r.validDuration,
            isActive: r.isActive
        }));
    }

    /**
     * Admin: Find all rewards
     */
    async findAll() {
        return this.prisma.pointReward.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    /**
     * Admin: Create a reward
     */
    async create(data: any) {
        return this.prisma.pointReward.create({
            data: {
                ...data,
                discountValue: Number(data.discountValue),
                maxDiscountAmount: data.maxDiscountAmount ? Number(data.maxDiscountAmount) : null,
                minOrderAmount: data.minOrderAmount ? Number(data.minOrderAmount) : null,
            }
        });
    }

    /**
     * Admin: Update a reward
     */
    async update(id: string, data: any) {
        return this.prisma.pointReward.update({
            where: { id },
            data: {
                ...data,
                discountValue: data.discountValue ? Number(data.discountValue) : undefined,
                maxDiscountAmount: data.maxDiscountAmount !== undefined ? (data.maxDiscountAmount ? Number(data.maxDiscountAmount) : null) : undefined,
                minOrderAmount: data.minOrderAmount !== undefined ? (data.minOrderAmount ? Number(data.minOrderAmount) : null) : undefined,
            }
        });
    }

    /**
     * Admin: Delete a reward
     */
    async delete(id: string) {
        return this.prisma.pointReward.delete({
            where: { id }
        });
    }
}
