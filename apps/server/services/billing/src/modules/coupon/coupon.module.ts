import { Module } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { CouponRepository } from './coupon.repository';
import { CouponHandler } from './coupon.handler';
import { RedisModule, NatsClientModule } from '@server/shared';
import { CouponProfile } from '@server/billing/infrastructure/mappings/coupon.profile';

@Module({
  imports: [RedisModule, NatsClientModule],
  controllers: [CouponHandler],
  providers: [CouponService, CouponRepository, CouponProfile],
  exports: [CouponService],
})
export class CouponModule {}
