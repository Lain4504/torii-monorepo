import { Module } from '@nestjs/common';
import { AssignmentSubmissionModule } from './assignment-submission/assignment-submission.module';

@Module({
  imports: [AssignmentSubmissionModule],
})
export class AssessmentModule {}

