import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { Prisma } from '@prisma/generated';

@Injectable()
export class CouponRepository {
    private readonly logger = new Logger(CouponRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    async findByCode(code: string) {
        return this.prisma.coupon.findUnique({
            where: { code },
        });
    }

    async findById(id: string) {
        return this.prisma.coupon.findUnique({
            where: { id },
        });
    }

    async incrementUsage(id: string) {
        return this.prisma.coupon.update({
            where: { id },
            data: {
                usageCount: { increment: 1 },
            },
        });
    }

    // Decrement usage if transaction fails
    async decrementUsage(id: string) {
        return this.prisma.coupon.update({
            where: { id },
            data: {
                usageCount: { decrement: 1 },
            },
        });
    }

    async create(data: Prisma.CouponCreateInput) {
        return this.prisma.coupon.create({
            data,
        });
    }

    async update(id: string, data: Prisma.CouponUpdateInput) {
        return this.prisma.coupon.update({
            where: { id },
            data,
        });
    }

    async checkUserUsage(userId: string, couponId: string): Promise<number> {
        // Since we don't have a direct UserCoupon usage table yet other than Orders,
        // we count how many non-failed/cancelled orders this user has with this coupon.
        // Or we should rely on Order table query.

        const count = await this.prisma.order.count({
            where: {
                userId,
                couponId,
                status: {
                    notIn: ['failed', 'cancelled'] // Assuming Prisma enum mapping works or use strings
                }
            }
        });

        return count;
    }
}
