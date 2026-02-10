import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AutomapperModule } from '@automapper/nestjs';
import { pojos } from '@automapper/pojos';
import { PrismaModule, SharedModule, GlobalRpcExceptionFilter, NatsClientModule } from '@server/shared';

// Billing Modules
import { OrderModule } from './modules/payment/order.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { UserBalanceModule } from './modules/user-balance/user-balance.module';

// Handlers
import { OrderHandler } from './interfaces/nats/order.handler';
import { CouponHandler } from './interfaces/nats/coupon.handler';
import { AnalyticsHandler } from './interfaces/nats/analytics.handler';
import { UserBalanceHandler } from './interfaces/nats/user-balance.handler';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        AutomapperModule.forRoot({ strategyInitializer: pojos() }),
        PrismaModule,
        SharedModule,
        NatsClientModule,

        // Billing Modules
        OrderModule,
        CouponModule,
        UserBalanceModule,
    ],
    controllers: [
        // NATS Handlers
        OrderHandler,
        CouponHandler,
        AnalyticsHandler,
        UserBalanceHandler,
    ],
    providers: [
        {
            provide: APP_FILTER,
            useClass: GlobalRpcExceptionFilter,
        },
    ],
})
export class BillingModule { }
