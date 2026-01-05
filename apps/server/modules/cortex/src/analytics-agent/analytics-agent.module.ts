import { Module } from '@nestjs/common';
import { AnalyticsAgentService } from './analytics-agent.service';

@Module({
  controllers: [],
  providers: [AnalyticsAgentService],
  exports: [AnalyticsAgentService],
})
export class AnalyticsAgentModule {}
