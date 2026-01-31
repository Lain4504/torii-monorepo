import { Module } from '@nestjs/common';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { CouponRepository } from './coupon.repository';
import { RedisModule } from '@server/shared';

@Module({
    imports: [RedisModule],
    controllers: [CouponController],
    providers: [CouponService, CouponRepository],
    exports: [CouponService],
})
export class CouponModule { }
