import { Module } from '@nestjs/common';
import { AssessmentAgentService } from './assessment-agent.service';
import { SharedModule } from '../shared/shared.module';
import { ASSESSMENT_AGENT_SERVICE_TOKEN } from '../interfaces/services';
import { AssessmentAgentController } from '../messaging/assessment-agent.controller';

@Module({
  imports: [SharedModule],
  controllers: [AssessmentAgentController],
  providers: [
    {
      provide: ASSESSMENT_AGENT_SERVICE_TOKEN,
      useClass: AssessmentAgentService,
    },
  ],
  exports: [ASSESSMENT_AGENT_SERVICE_TOKEN],
})
export class AssessmentAgentModule {}
