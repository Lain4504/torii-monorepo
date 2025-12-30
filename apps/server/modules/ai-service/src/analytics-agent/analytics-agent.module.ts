import { Module } from '@nestjs/common';
import { AnalyticsAgentService } from './analytics-agent.service';

@Module({
  providers: [AnalyticsAgentService],
  exports: [AnalyticsAgentService],
})
export class AnalyticsAgentModule {}
