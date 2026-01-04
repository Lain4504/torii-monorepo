import { Module } from '@nestjs/common';
import { SenseiAgentModule } from './sensei-agent/sensei-agent.module';
import { AssessmentAgentModule } from './assessment-agent/assessment-agent.module';
import { AnalyticsAgentModule } from './analytics-agent/analytics-agent.module';

@Module({
  imports: [SenseiAgentModule, AssessmentAgentModule, AnalyticsAgentModule],
  controllers: [],
  providers: [],
})
export class CortexModule { }
