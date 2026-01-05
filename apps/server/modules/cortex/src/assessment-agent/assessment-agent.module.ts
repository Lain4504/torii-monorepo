import { Module } from '@nestjs/common';
import { AssessmentAgentService } from './assessment-agent.service';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [],
  providers: [AssessmentAgentService],
  exports: [AssessmentAgentService],
})
export class AssessmentAgentModule {}
