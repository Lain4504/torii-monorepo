import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AutomapperModule } from '@automapper/nestjs';
import { pojos } from '@automapper/pojos';
import { PrismaModule, SharedModule, GlobalRpcExceptionFilter, NatsClientModule } from '@server/shared';

// Billing Modules
import { OrderModule } from './modules/payment/order.module';
import { CouponModule } from './modules/coupon/coupon.module';

// Handlers
import { OrderHandler } from './interfaces/nats/order.handler';
import { CouponHandler } from './interfaces/nats/coupon.handler';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ScheduleModule.forRoot(),
        AutomapperModule.forRoot({ strategyInitializer: pojos() }),
        PrismaModule,
        SharedModule,
        NatsClientModule,

        // Billing Modules
        OrderModule,
        CouponModule,
    ],
    controllers: [
        // NATS Handlers
        OrderHandler,
        CouponHandler,
    ],
    providers: [
        {
            provide: APP_FILTER,
            useClass: GlobalRpcExceptionFilter,
        },
    ],
})
export class BillingModule { }
