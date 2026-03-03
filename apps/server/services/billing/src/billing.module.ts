import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { AutomapperModule } from '@automapper/nestjs';
import { pojos } from '@automapper/pojos';
import { PrismaModule, SharedModule, GlobalRpcExceptionFilter, NatsClientModule } from '@server/shared';

// Billing Modules
import { OrderModule, CouponModule, UserBalanceModule, ReportModule, AnalyticsModule } from './modules';

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
        ReportModule,
        AnalyticsModule,
    ],
    controllers: [],
    providers: [
        {
            provide: APP_FILTER,
            useClass: GlobalRpcExceptionFilter,
        },
    ],
})
export class BillingModule { }
