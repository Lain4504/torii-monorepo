import { Module } from '@nestjs/common';
import { FastMcpModule } from '@server/agents/fastmcp/fastmcp.module';
import { NatsClientModule } from '@server/shared';
import { AnalyticsService } from './analytics.service';


@Module({
    imports: [FastMcpModule, NatsClientModule],
    providers: [AnalyticsService],
    exports: [AnalyticsService],
})
export class AnalyticsModule { }
