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
        // Deduct points
        await this.prisma.userGamification.update({
            where: { userId },
            data: {
                points: { decrement: reward.points }
            }
        });

        this.logger.log(`User ${userId} redeemed ${reward.points} points for coupon: ${reward.name}`);

        // Request Billing to create a personal coupon
        try {
            const coupon = await lastValueFrom(
                this.natsClient.send('billing.coupon.createRedeemed', {
                    userId,
                    name: reward.name,
                    discountType: reward.discountType,
                    discountValue: Number(reward.discountValue),
                    validDurationDays: reward.validDuration || 30,
                    maxDiscountAmount: reward.maxDiscountAmount ? Number(reward.maxDiscountAmount) : null,
                    minOrderAmount: reward.minOrderAmount ? Number(reward.minOrderAmount) : null
                })
            );

            // Log history
            await this.prisma.gamificationHistory.create({
                data: {
                    userId,
                    amount: -reward.points,
                    type: 'REDEEM' as any,
                    description: `Đã đổi ${reward.points} điểm lấy mã giảm giá: ${reward.name}`,
                    metadata: { rewardId, couponCode: coupon.code }
                }
            });

            return {
                success: true,
                pointsDeducted: reward.points,
                remainingPoints: gamification.points - reward.points,
                couponCode: coupon.code,
                coupon
            };
        } catch (error: any) {
            this.logger.error(`Failed to create redeemed coupon for user ${userId}: ${error.message}`);
            // Rollback points if coupon creation fails
            await this.prisma.userGamification.update({
                where: { userId },
                data: {
                    points: { increment: reward.points }
                }
            });
            throw new BadRequestException('Đã có lỗi xảy ra khi tạo mã giảm giá. Điểm của bạn đã được hoàn lại.');
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
