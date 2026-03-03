import { Module } from '@nestjs/common';
import { AnalyticsController } from './analytics.controller';
import { ReportController } from './report.controller';
import { NatsClientModule } from '@server/shared';

@Module({
    imports: [NatsClientModule],
    controllers: [AnalyticsController, ReportController],
    providers: [],
})
export class AnalyticsModule { }
