import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { CouponStatus } from '@prisma/generated';

@Injectable()
export class CouponCronService {
  private readonly logger = new Logger(CouponCronService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCouponExpirations() {
    this.logger.log('Starting scheduled coupon expiration check...');
    try {
      const now = new Date();

      // 1. Expire by date
      const expiredByDate = await this.prisma.coupon.updateMany({
        where: {
          status: CouponStatus.ACTIVE,
          endDate: { lte: now },
        },
        data: { status: CouponStatus.INACTIVE },
      });

      if (expiredByDate.count > 0) {
        this.logger.log(
          `Deactivated ${expiredByDate.count} coupons due to expiration date reached.`,
        );
      }

      // 2. Expire by usage limit
      const deactivatedUsageCount = await this.deactivateCouponsReachedLimit();

      if (deactivatedUsageCount === 0 && expiredByDate.count === 0) {
        this.logger.log('No coupons needed deactivation.');
      }

      this.logger.log('Scheduled coupon expiration check completed.');
    } catch (error) {
      this.logger.error(
        'Error during scheduled coupon expiration check:',
        error,
      );
    }
  }

  private async deactivateCouponsReachedLimit(): Promise<number> {
    // Find coupons where usageCount >= usageLimit
    const couponsToDeactivate = await this.prisma.coupon.findMany({
      where: {
        status: CouponStatus.ACTIVE,
        usageLimit: { not: null },
      },
      select: { id: true, usageCount: true, usageLimit: true },
    });

    const idsToDeactivate = couponsToDeactivate
      .filter((c) => c.usageCount >= (c.usageLimit as number))
      .map((c) => c.id);

    if (idsToDeactivate.length > 0) {
      await this.prisma.coupon.updateMany({
        where: { id: { in: idsToDeactivate } },
        data: { status: CouponStatus.INACTIVE },
      });
      this.logger.log(
        `Deactivated ${idsToDeactivate.length} coupons due to usage limit reached.`,
      );
      return idsToDeactivate.length;
    }
    return 0;
  }
}
