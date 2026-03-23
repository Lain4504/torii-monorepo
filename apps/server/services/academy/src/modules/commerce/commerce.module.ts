import { Module } from '@nestjs/common';
import { CourseOfferingModule } from './course-offering/course-offering.module';
import { QuotaModule } from './quota/quota.module';
import { OrderService } from './order/order.service';
import { OrderHandler } from './order/order.handler';
import { OrderListener } from './order.listener';
import { CouponService } from './coupon.service';
import { CouponHandler } from './coupon.handler';
import { PayOSService } from './payos.service';
import { CouponCronService } from './coupon-cron.service';
import { EnrollmentModule } from '../classroom/enrollment/enrollment.module';
import { ClassModule } from '../classroom/class/class.module';
import { NatsClientModule } from '@server/shared';

@Module({
  imports: [
    CourseOfferingModule,
    EnrollmentModule,
    ClassModule,
    NatsClientModule,
    QuotaModule,
  ],
  controllers: [OrderHandler, OrderListener, CouponHandler],
  providers: [OrderService, CouponService, PayOSService, CouponCronService],
  exports: [OrderService, CourseOfferingModule, CouponService, QuotaModule],
})
export class CommerceModule {}
