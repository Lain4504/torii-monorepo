import { Module } from '@nestjs/common';
import { AssessmentAgentService } from './assessment-agent.service';

@Module({
  controllers: [],
  providers: [AssessmentAgentService],
  exports: [AssessmentAgentService],
})
export class AssessmentAgentModule {}
