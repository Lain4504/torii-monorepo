import { Module } from '@nestjs/common';
import { CourseOfferingModule } from './course-offering/course-offering.module';
import { QuotaModule } from './quota/quota.module';
import { OrderService } from './order/order.service';
import { OrderHandler } from './order/order.handler';
import { CouponService } from './coupon.service';
import { CouponHandler } from './coupon.handler';
import { PayOSService } from './payos.service';
import { EnrollmentModule } from '../classroom/enrollment/enrollment.module';

@Module({
  imports: [CourseOfferingModule, EnrollmentModule, QuotaModule],
  controllers: [OrderHandler, CouponHandler],
  providers: [OrderService, CouponService, PayOSService],
  exports: [OrderService, CourseOfferingModule, CouponService, QuotaModule],
})
export class CommerceModule { }
