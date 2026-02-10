import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AutomapperModule } from '@automapper/nestjs';
import { pojos } from '@automapper/pojos';
import { PrismaModule, SharedModule, GlobalRpcExceptionFilter, NatsClientModule } from '@server/shared';

// Billing Modules
import { OrderModule } from './modules/payment/order.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { CoinModule } from './modules/coin/coin.module';

// Handlers
import { OrderHandler } from './interfaces/nats/order.handler';
import { CouponHandler } from './interfaces/nats/coupon.handler';
import { AnalyticsHandler } from './interfaces/nats/analytics.handler';
import { CoinHandler } from './interfaces/nats/coin.handler';

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
        CoinModule,
    ],
    controllers: [
        // NATS Handlers
        OrderHandler,
        CouponHandler,
        AnalyticsHandler,
        CoinHandler,
    ],
    providers: [
        {
            provide: APP_FILTER,
            useClass: GlobalRpcExceptionFilter,
        },
    ],
})
export class BillingModule { }
