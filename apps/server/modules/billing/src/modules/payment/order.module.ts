import { Module } from '@nestjs/common';
import { PrismaModule, NatsClientModule } from '@server/shared';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { PayOSService } from './payos.service';
import { PaymentCron } from './payment.cron';
import { ORDER_SERVICE_TOKEN, ORDER_REPOSITORY_TOKEN } from '../../interfaces';
import { CouponModule } from '../coupon/coupon.module';

/**
 * Order Module (Handling Orders and Payments)
 */
@Module({
    imports: [PrismaModule, NatsClientModule, CouponModule],
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
    ],
    exports: [ORDER_SERVICE_TOKEN, ORDER_REPOSITORY_TOKEN, PayOSService],
})
export class OrderModule { }
