import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { OrderController } from './controllers/order.controller';
import { PayOSController } from './controllers/payos.controller';
import { CouponController } from './controllers/coupon.controller';

/**
 * Billing Module for Gateway
 * Handles all Billing service HTTP routes via NATS
 */
@Module({
  imports: [NatsClientModule],
  controllers: [OrderController, PayOSController, CouponController],
})
export class BillingModule {}
