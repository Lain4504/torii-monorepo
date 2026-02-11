import { Module } from '@nestjs/common';
import { FastMcpModule } from '@server/agents/fastmcp/fastmcp.module';
import { AnalyticsService } from './analytics.service';


@Module({
    imports: [FastMcpModule],
    providers: [AnalyticsService],
    exports: [AnalyticsService],
})
export class AnalyticsModule { }
