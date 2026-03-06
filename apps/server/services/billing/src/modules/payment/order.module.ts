import { Module } from '@nestjs/common';
import { PrismaModule, NatsClientModule } from '@server/shared';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { PayOSService } from './payos.service';
import { PaymentCron } from './payment.cron';
import { OrderHandler } from './order.handler';
import {
  ORDER_SERVICE_TOKEN,
  ORDER_REPOSITORY_TOKEN,
} from '@server/billing/interfaces';
import { CouponModule } from '@server/billing/modules/coupon/coupon.module';
import { UserBalanceModule } from '@server/billing/modules/user-balance/user-balance.module';
import { OrderProfile } from '@server/billing/infrastructure/mappings/order.profile';
import { PaymentProfile } from '@server/billing/infrastructure/mappings/payment.profile';

/**
 * Order Module (Handling Orders and Payments)
 */
@Module({
  imports: [PrismaModule, NatsClientModule, CouponModule, UserBalanceModule],
  controllers: [OrderHandler],
  providers: [
    OrderService,
    PayOSService,
    PaymentCron,
    {
      provide: ORDER_SERVICE_TOKEN,
      useClass: OrderService,
    },
    OrderRepository,
    {
      provide: ORDER_REPOSITORY_TOKEN,
      useClass: OrderRepository,
    },
    OrderProfile,
    PaymentProfile,
  ],
  exports: [ORDER_SERVICE_TOKEN, ORDER_REPOSITORY_TOKEN, PayOSService],
})
export class OrderModule {}
