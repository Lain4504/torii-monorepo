import { Module } from '@nestjs/common';
import { CouponHandler } from '@server/learning/modules/coupon/coupon.handler';
import { NatsClientModule } from '@server/shared';
import { CouponService } from '@server/learning/modules/coupon/coupon.service';
import { CouponRepository } from '@server/learning/modules/coupon/coupon.repository';
import { CouponScheduler } from '@server/learning/modules/coupon/coupon.scheduler';
import { CouponProfile } from '@server/learning/infrastructure/mappings/coupon.profile';
import { COUPON_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories';
import { COUPON_SERVICE_TOKEN } from '@server/learning/interfaces/services';

/**
 * Coupon Feature Module
 * Handles coupon management operations
 */
@Module({
  imports: [NatsClientModule],
  controllers: [CouponHandler],
  providers: [
    {
      provide: COUPON_REPOSITORY_TOKEN,
      useClass: CouponRepository,
    },
    {
      provide: COUPON_SERVICE_TOKEN,
      useClass: CouponService,
    },
    CouponScheduler,
    CouponProfile,
  ],
  exports: [COUPON_SERVICE_TOKEN, COUPON_REPOSITORY_TOKEN],
})
export class CouponModule {}
