import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AutomapperModule } from '@automapper/nestjs';
import { pojos } from '@automapper/pojos';
import { PrismaModule, SharedModule, GlobalRpcExceptionFilter } from '@server/shared';

// Billing Modules
import { OrderModule } from './modules/payment/order.module';

// Handlers
import { OrderHandler } from './interfaces/nats/order.handler';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ScheduleModule.forRoot(),
        AutomapperModule.forRoot({ strategyInitializer: pojos() }),
        PrismaModule,
        SharedModule,

        // Billing Modules
        OrderModule,
    ],
    controllers: [
        // NATS Handlers
        OrderHandler,
    ],
    providers: [
        {
            provide: APP_FILTER,
            useClass: GlobalRpcExceptionFilter,
        },
    ],
})
export class BillingModule { }
