import { Module } from '@nestjs/common';
import { AssessmentAgentService } from './assessment-agent.service';
import { AssessmentAgentController } from './assessment-agent.controller';

@Module({
  controllers: [AssessmentAgentController],
  providers: [AssessmentAgentService],
  exports: [AssessmentAgentService],
})
export class AssessmentAgentModule {}
