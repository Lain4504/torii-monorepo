import { Module } from '@nestjs/common';
import { CourseOfferingModule } from './course-offering/course-offering.module';
import { OrderService } from './order/order.service';
import { OrderHandler } from './order/order.handler';
import { CouponService } from './coupon.service';
import { PayOSService } from './payos.service';
import { EnrollmentModule } from '../classroom/enrollment/enrollment.module';

@Module({
  imports: [CourseOfferingModule, EnrollmentModule],
  controllers: [OrderHandler],
  providers: [OrderService, CouponService, PayOSService],
  exports: [OrderService, CourseOfferingModule],
})
export class CommerceModule { }
