import { Injectable, Logger, Inject, BadRequestException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { CouponRepository } from './coupon.repository';
import {
    CouponStatus,
    CouponDiscountType,
    type CouponValidateResponseDTO
} from '@workspace/schemas';
import { REDIS_CLIENT } from '@server/shared';
import { Redis } from 'ioredis';

@Injectable()
export class CouponService {
    private readonly logger = new Logger(CouponService.name);

    constructor(
        private readonly couponRepository: CouponRepository,
        @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    ) { }

    /**
     * Validate coupon without redeeming (for UI check)
     */
    async validateCoupon(code: string, userId: string, orderAmount: number): Promise<CouponValidateResponseDTO> {
        const coupon = await this.couponRepository.findByCode(code);

        if (!coupon) {
            return { isValid: false, message: 'Coupon not found' };
        }

        if (coupon.status !== CouponStatus.ACTIVE) {
            this.logger.warn(`Coupon ${code} verification failed: Status is ${coupon.status}`);
            return { isValid: false, message: 'Coupon is not active' };
        }

        const now = new Date();
        if (now < coupon.validFrom || now > coupon.validUntil) {
            this.logger.warn(`Coupon ${code} verification failed: Date mismatch. Now: ${now}, From: ${coupon.validFrom}, Until: ${coupon.validUntil}`);
            return { isValid: false, message: 'Coupon is expired or not yet valid' };
        }

        if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
            this.logger.warn(`Coupon ${code} verification failed: Usage limit reached (${coupon.usageCount}/${coupon.usageLimit})`);
            return { isValid: false, message: 'Coupon usage limit reached' };
        }

        if (coupon.minOrderAmount && orderAmount < Number(coupon.minOrderAmount)) {
            this.logger.warn(`Coupon ${code} verification failed: Min order amount ${coupon.minOrderAmount} > ${orderAmount}`);
            return { isValid: false, message: `Minimum order amount of ${coupon.minOrderAmount} required` };
        }

        // Ownership check (Personal Coupons)
        if (coupon.userId && coupon.userId !== userId) {
            this.logger.warn(`Coupon ${code} verification failed: Ownership mismatch. Coupon belongs to ${coupon.userId}, but used by ${userId}`);
            return { isValid: false, message: 'Mã giảm giá không thuộc về bạn' };
        }

        // Check user usage limit
        const userUsage = await this.couponRepository.checkUserUsage(userId, coupon.id);
        if (coupon.userUsageLimit && userUsage >= coupon.userUsageLimit) {
            this.logger.warn(`Coupon ${code} verification failed: User ${userId} usage limit reached (${userUsage}/${coupon.userUsageLimit})`);
            return { isValid: false, message: 'You have reached the usage limit for this coupon' };
        }

        const { finalPrice, discountAmount } = this.calculateDiscount(orderAmount, coupon);

        return {
            isValid: true,
            coupon: {
                ...coupon,
                discountValue: Number(coupon.discountValue),
                maxDiscountAmount: coupon.maxDiscountAmount ? Number(coupon.maxDiscountAmount) : null,
                minOrderAmount: coupon.minOrderAmount ? Number(coupon.minOrderAmount) : null,
                // Ensure other Decimal/Date fields are handled if needed by DTO
            } as any,
            discountAmount,
            message: 'Coupon is valid'
        };
    }

    /**
     * Redeem coupon with distributed lock
     */
    async redeemCoupon(code: string, userId: string, orderAmount: number): Promise<{ couponId: string, discountAmount: number }> {
        const lockKey = `lock:coupon:${code}`;
        // Try to acquire lock for 5 seconds
        // NX: Set only if not exists
        // EX: Expire after 5 seconds
        const acquired = await this.redisClient.set(lockKey, 'LOCKED', 'EX', 5, 'NX');

        if (!acquired) {
            this.logger.warn(`Failed to acquire lock for coupon ${code}`);
            throw new ConflictException('Coupon is currently being processed by another user. Please try again.');
        }

        try {
            // Re-validate everything inside the lock
            const validation = await this.validateCoupon(code, userId, orderAmount);

            if (!validation.isValid) {
                throw new BadRequestException(validation.message || 'Invalid coupon');
            }

            if (!validation.coupon) {
                throw new InternalServerErrorException('Validation passed but coupon missing');
            }

            // Increment usage
            await this.couponRepository.incrementUsage(validation.coupon.id);

            return {
                couponId: validation.coupon.id,
                discountAmount: validation.discountAmount || 0
            };

        } catch (error) {
            throw error;
        } finally {
            // Release lock
            await this.redisClient.del(lockKey);
        }
    }

    calculateDiscount(orderAmount: number, coupon: any): { finalPrice: number, discountAmount: number } {
        let discount = 0;
        const value = Number(coupon.discountValue);

        if (coupon.discountType === CouponDiscountType.PERCENTAGE) {
            discount = orderAmount * (value / 100);
            if (coupon.maxDiscountAmount) {
                discount = Math.min(discount, Number(coupon.maxDiscountAmount));
            }
        } else {
            discount = value;
        }

        // Ensure discount doesn't exceed order amount
        discount = Math.min(discount, orderAmount);
        const finalPrice = orderAmount - discount;

        return { finalPrice, discountAmount: discount };
    }

    /**
     * Release coupon (decrement usage)
     * Used when order is cancelled or failed
     */
    async releaseCoupon(couponId: string): Promise<void> {
        try {
            await this.couponRepository.decrementUsage(couponId);
            this.logger.log(`Released coupon ${couponId} (usage decremented)`);
        } catch (error: any) {
            this.logger.error(`Failed to release coupon ${couponId}: ${error.message}`);
        }
    }

    /**
     * Create a personal coupon for a user (Redeemed Coupon)
     */
    async createRedeemedCoupon(data: {
        userId: string;
        name: string;
        discountType: CouponDiscountType;
        discountValue: number;
        maxDiscountAmount?: number;
        minOrderAmount?: number;
        validDurationDays?: number;
    }) {
        const code = this.generateRandomCode();
        const now = new Date();
        const validUntil = new Date();
        validUntil.setDate(now.getDate() + (data.validDurationDays || 30));

        return this.couponRepository.create({
            code,
            name: data.name,
            discountType: data.discountType,
            discountValue: data.discountValue,
            maxDiscountAmount: data.maxDiscountAmount,
            minOrderAmount: data.minOrderAmount,
            validFrom: now,
            validUntil,
            user: { connect: { id: data.userId } },
            userUsageLimit: 1,
            usageLimit: 1,
            status: CouponStatus.ACTIVE,
        });
    }

    async getCouponsForUser(userId: string) {
        const coupons = await this.couponRepository.findCouponsForUser(userId);

        // Filter public coupons where user reached limit
        const availableCoupons: any[] = [];
        for (const coupon of coupons) {
            // For personal coupons, they are already filtered by userId in repo
            if (coupon.userId === userId) {
                availableCoupons.push(coupon);
                continue;
            }

            // For public coupons, check usage limit
            if (coupon.userUsageLimit) {
                const usage = await this.couponRepository.checkUserUsage(userId, coupon.id);
                if (usage >= coupon.userUsageLimit) {
                    continue;
                }
            }

            // Also check global usage limit
            if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
                continue;
            }

            availableCoupons.push(coupon);
        }

        return availableCoupons;
    }

    private generateRandomCode(): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const part1 = Array.from({ length: 3 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        const part2 = Array.from({ length: 3 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
        return `${part1}-${part2}`;
    }
}
