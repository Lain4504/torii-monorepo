import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CouponStatus } from '@workspace/schemas';
import type { ICouponRepository } from '@server/learning/interfaces/repositories';
import { COUPON_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories';

/**
 * Coupon Scheduler
 * Handles scheduled tasks for coupon management
 */
@Injectable()
export class CouponScheduler {
    private readonly logger = new Logger(CouponScheduler.name);

    constructor(
        @Inject(COUPON_REPOSITORY_TOKEN)
        private readonly couponRepository: ICouponRepository,
    ) { }

    /**
     * Auto-expire expired coupons
     * Runs every day at 00:00 (midnight) to update expired coupons status
     * Cron expression: '0 0 * * *' (at 00:00 every day)
     * 
     * Logic:
     * - Find all coupons where validUntil < NOW() and status != 'expired'
     * - Update their status to 'expired'
     */
    @Cron('0 0 * * *', {
        name: 'auto-expire-coupons',
        timeZone: 'Asia/Ho_Chi_Minh',
    })
    async handleAutoExpireCoupons() {
        this.logger.log('🕐 Auto-expire coupons cronjob triggered (00:00 daily)');
        try {
            const expiredCoupons = await this.couponRepository.findExpiredCoupons();
            
            if (expiredCoupons.length === 0) {
                this.logger.log('✅ No expired coupons to update');
                return;
            }

            let updatedCount = 0;
            for (const coupon of expiredCoupons) {
                try {
                    await this.couponRepository.updateStatus(coupon.id, CouponStatus.EXPIRED);
                    updatedCount++;
                } catch (error: any) {
                    this.logger.error(`Failed to expire coupon ${coupon.id}: ${error?.message}`, error?.stack);
                }
            }

            this.logger.log(`✅ Auto-expire coupons completed: ${updatedCount}/${expiredCoupons.length} coupons expired`);
        } catch (error: any) {
            this.logger.error(
                `❌ Error in auto-expire coupons cronjob: ${error?.message}`,
                error?.stack,
            );
            // Don't throw - cronjob errors should be logged but not crash the app
        }
    }
}

