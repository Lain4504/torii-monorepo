import { Module } from '@nestjs/common';
import { AnalyticsAgentService } from './analytics-agent.service';
import { AnalyticsAgentController } from './analytics-agent.controller';

@Module({
  controllers: [AnalyticsAgentController],
  providers: [AnalyticsAgentService],
  exports: [AnalyticsAgentService],
})
export class AnalyticsAgentModule {}
