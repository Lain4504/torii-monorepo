import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { OrderController } from './controllers/order.controller';
import { PayOSController } from './controllers/payos.controller';

/**
 * Billing Module for Gateway
 * Handles all Billing service HTTP routes via NATS
 */
@Module({
    imports: [NatsClientModule],
    controllers: [
        OrderController,
        PayOSController,
    ],
})
export class BillingModule { }
