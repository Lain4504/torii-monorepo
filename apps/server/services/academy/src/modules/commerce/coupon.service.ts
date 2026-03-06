import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { CouponStatus, CouponDiscountType, CouponScope } from '@prisma/generated';

@Injectable()
export class CouponService {
    constructor(private readonly prisma: PrismaService) { }

    async findByCode(code: string) {
        const coupon = await this.prisma.coupon.findUnique({
            where: { code: code.toUpperCase() },
        });
        if (!coupon) throw new NotFoundException('Coupon not found');
        return coupon;
    }

    async validateCoupon(code: string, userId: string, orderValue: number, offeringIds: string[]) {
        const coupon = await this.findByCode(code);

        if (coupon.status !== CouponStatus.ACTIVE) {
            throw new BadRequestException('Coupon is not active');
        }

        const now = new Date();
        if (coupon.startDate && coupon.startDate > now) {
            throw new BadRequestException('Coupon is not yet valid');
        }
        if (coupon.endDate && coupon.endDate < now) {
            throw new BadRequestException('Coupon has expired');
        }

        if (coupon.usageLimit !== null && coupon.usageCount >= coupon.usageLimit) {
            throw new BadRequestException('Coupon usage limit reached');
        }

        if (coupon.minOrderValue !== null && orderValue < Number(coupon.minOrderValue)) {
            throw new BadRequestException(`Minimum order value of ${coupon.minOrderValue} required`);
        }

        // Check per-user limit
        const userUsageCount = await this.prisma.couponUsage.count({
            where: { couponId: coupon.id, userId },
        });
        if (userUsageCount >= coupon.perUserLimit) {
            throw new BadRequestException('You have reached the usage limit for this coupon');
        }

        // Check scope
        if (coupon.scope === CouponScope.SPECIFIC_OFFERING) {
            const metadata = coupon.metadata as any;
            const allowedOfferingIds = metadata?.offeringIds || [];
            const hasValidOffering = offeringIds.some(id => allowedOfferingIds.includes(id));
            if (!hasValidOffering) {
                throw new BadRequestException('Coupon is not applicable to the selected offerings');
            }
        }

        return coupon;
    }

    async calculateDiscount(couponId: string, orderValue: number) {
        const coupon = await this.prisma.coupon.findUnique({ where: { id: couponId } });
        if (!coupon) return 0;

        let discount = 0;
        if (coupon.discountType === CouponDiscountType.PERCENTAGE) {
            discount = orderValue * (Number(coupon.discountValue) / 100);
            if (coupon.maxDiscountAmount !== null && discount > Number(coupon.maxDiscountAmount)) {
                discount = Number(coupon.maxDiscountAmount);
            }
        } else {
            discount = Number(coupon.discountValue);
        }

        return Math.min(discount, orderValue);
    }

    async recordUsage(tx: any, couponId: string, userId: string, orderId: string) {
        await tx.coupon.update({
            where: { id: couponId },
            data: { usageCount: { increment: 1 } },
        });
        await tx.couponUsage.create({
            data: {
                couponId,
                userId,
                orderId,
            },
        });
    }
}
