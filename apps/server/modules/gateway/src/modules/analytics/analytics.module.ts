import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { NatsClientModule } from '@server/shared';

@Module({
    imports: [NatsClientModule],
    controllers: [AnalyticsController],
    providers: [],
})
export class AnalyticsModule { }
