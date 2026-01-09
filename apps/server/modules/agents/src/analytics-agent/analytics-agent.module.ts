import { Module } from '@nestjs/common';
import { AnalyticsAgentService } from './analytics-agent.service';
import { SharedModule } from '../shared/shared.module';
import { ANALYTICS_AGENT_SERVICE_TOKEN } from '../interfaces/services';
import { AnalyticsAgentController } from '../messaging/analytics-agent.controller';

@Module({
  imports: [SharedModule],
  controllers: [AnalyticsAgentController],
  providers: [
    {
      provide: ANALYTICS_AGENT_SERVICE_TOKEN,
      useClass: AnalyticsAgentService,
    },
  ],
  exports: [ANALYTICS_AGENT_SERVICE_TOKEN],
})
export class AnalyticsAgentModule {}
