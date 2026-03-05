import { Module } from '@nestjs/common';
import { AssignmentSubmissionHandler } from './assignment-submission.handler';
import { AssignmentSubmissionService } from './assignment-submission.service';

@Module({
  providers: [AssignmentSubmissionService],
  controllers: [AssignmentSubmissionHandler],
})
export class AssignmentSubmissionModule {}

