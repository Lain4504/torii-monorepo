import { Module } from '@nestjs/common';
import { FastMcpModule } from '@server/agents/fastmcp/fastmcp.module';
import { NatsClientModule } from '@server/shared';
import { AnalyticsService } from './analytics.service';


import { AIUsageTrackingService } from './ai-usage-tracking.service';

@Module({
    imports: [FastMcpModule, NatsClientModule],
    providers: [AnalyticsService, AIUsageTrackingService],
    exports: [AnalyticsService, AIUsageTrackingService],
})
export class AnalyticsModule { }
