import { Module } from '@nestjs/common';
import { SenseiAgentModule } from './sensei-agent/sensei-agent.module';
import { AssessmentAgentModule } from './assessment-agent/assessment-agent.module';
import { AnalyticsAgentModule } from './analytics-agent/analytics-agent.module';
import { SenseiController } from './interfaces/http/sensei.controller';
import { AssessmentController } from './interfaces/http/assessment.controller';
import { AnalyticsController } from './interfaces/http/analytics.controller';

@Module({
  imports: [SenseiAgentModule, AssessmentAgentModule, AnalyticsAgentModule],
  controllers: [SenseiController, AssessmentController, AnalyticsController],
  providers: [],
})
export class CortexModule { }
