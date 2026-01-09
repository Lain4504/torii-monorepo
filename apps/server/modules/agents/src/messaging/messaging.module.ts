import { Module } from '@nestjs/common';
import { SenseiAgentController } from './sensei-agent.controller';
import { AssessmentAgentController } from './assessment-agent.controller';
import { AnalyticsAgentController } from './analytics-agent.controller';
import { SenseiAgentModule } from '../sensei-agent/sensei-agent.module';
import { AssessmentAgentModule } from '../assessment-agent/assessment-agent.module';
import { AnalyticsAgentModule } from '../analytics-agent/analytics-agent.module';

@Module({
  imports: [SenseiAgentModule, AssessmentAgentModule, AnalyticsAgentModule],
  controllers: [SenseiAgentController, AssessmentAgentController, AnalyticsAgentController],
})
export class MessagingModule {}
