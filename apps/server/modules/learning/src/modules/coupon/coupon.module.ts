import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { CouponService } from './coupon.service';
import { CouponRepository } from './coupon.repository';
import { CouponScheduler } from './coupon.scheduler';
import { COUPON_REPOSITORY_TOKEN } from '../../interfaces/repositories';
import { COUPON_SERVICE_TOKEN } from '../../interfaces/services';

/**
 * Coupon Feature Module
 * Handles coupon management operations
 */
@Module({
  imports: [
    NatsClientModule,
  ],
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
  ],
  exports: [COUPON_SERVICE_TOKEN, COUPON_REPOSITORY_TOKEN],
})
export class CouponModule { }
