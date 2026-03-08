import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { AuditLoggerService } from '../audit-logger.service';
import { CouponStatus, CouponDiscountType, CouponScope } from '@prisma/generated';

@Injectable()
export class CouponService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly audit: AuditLoggerService,
    ) { }

    private normalizeDiscountType(value: unknown): CouponDiscountType | undefined {
        if (value === undefined || value === null) return undefined;
        if (value === CouponDiscountType.PERCENTAGE || value === 'percentage') return CouponDiscountType.PERCENTAGE;
        if (value === CouponDiscountType.FIXED_AMOUNT || value === 'fixed_amount') return CouponDiscountType.FIXED_AMOUNT;
        throw new BadRequestException('Invalid discountType');
    }

    private normalizeStatus(value: unknown): CouponStatus | undefined {
        if (value === undefined || value === null) return undefined;
        if (value === CouponStatus.ACTIVE || value === 'active') return CouponStatus.ACTIVE;
        if (value === CouponStatus.INACTIVE || value === 'inactive' || value === 'expired') return CouponStatus.INACTIVE;
        throw new BadRequestException('Invalid status');
    }

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

    // --- Admin CRUD ---

    async admin_findAll() {
        return this.prisma.coupon.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async admin_findOne(id: string) {
        const coupon = await this.prisma.coupon.findUnique({
            where: { id },
        });
        if (!coupon) throw new NotFoundException('Coupon not found');
        return coupon;
    }

    async admin_create(data: any, actorId = 'SYSTEM') {
        const {
            discountType,
            status,
            applicableCourseMasterIds,
            excludedCourseMasterIds,
            applicableRunIds,
            excludedRunIds,
            ...rest
        } = data ?? {};

        const coupon = await this.prisma.coupon.create({
            data: {
                ...rest,
                code: data.code.toUpperCase(),
                discountType: this.normalizeDiscountType(discountType),
                status: this.normalizeStatus(status),
            },
        });

        await this.audit.log({
            userId: actorId,
            action: 'coupon.create',
            entity: 'Coupon',
            entityId: coupon.id,
            description: `Created coupon: ${coupon.code} (${coupon.discountType} - ${coupon.discountValue})`,
            newValues: { code: coupon.code, discountType: coupon.discountType, status: coupon.status },
        });

        return coupon;
    }

    async admin_update(id: string, data: any, actorId = 'SYSTEM') {
        const old = await this.admin_findOne(id);
        const {
            discountType,
            status,
            applicableCourseMasterIds,
            excludedCourseMasterIds,
            applicableRunIds,
            excludedRunIds,
            ...rest
        } = data ?? {};

        const updated = await this.prisma.coupon.update({
            where: { id },
            data: {
                ...rest,
                code: data.code?.toUpperCase(),
                discountType: this.normalizeDiscountType(discountType),
                status: this.normalizeStatus(status),
            },
        });

        await this.audit.log({
            userId: actorId,
            action: 'coupon.update',
            entity: 'Coupon',
            entityId: id,
            description: `Updated coupon: ${old.code}`,
            oldValues: { status: old.status, discountValue: old.discountValue },
            newValues: { status: updated.status, discountValue: updated.discountValue },
        });

        return updated;
    }

    async admin_delete(id: string, actorId = 'SYSTEM') {
        const coupon = await this.prisma.coupon.findUnique({ where: { id } });
        const result = await this.prisma.coupon.delete({ where: { id } });

        await this.audit.log({
            userId: actorId,
            action: 'coupon.delete',
            entity: 'Coupon',
            entityId: id,
            description: `Deleted coupon: ${coupon?.code}`,
            metadata: { code: coupon?.code },
        });

        return result;
    }
}
