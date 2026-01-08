import { Module } from '@nestjs/common';
import { AnalyticsAgentService } from './analytics-agent.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [],
  providers: [AnalyticsAgentService],
  exports: [AnalyticsAgentService],
})
export class AnalyticsAgentModule {}
