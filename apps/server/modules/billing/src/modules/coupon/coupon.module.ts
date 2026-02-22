import { Module } from '@nestjs/common';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { CouponRepository } from './coupon.repository';
import { RedisModule } from '@server/shared';
import { CouponProfile } from '@server/billing/infrastructure/mappings/coupon.profile';

@Module({
    imports: [RedisModule],
    controllers: [CouponController],
    providers: [CouponService, CouponRepository, CouponProfile],
    exports: [CouponService],
})
export class CouponModule { }
