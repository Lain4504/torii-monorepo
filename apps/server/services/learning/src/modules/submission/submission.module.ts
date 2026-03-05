import { Module, forwardRef } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { SubmissionService } from '@server/learning/modules/submission/submission.service';
import { SubmissionRepository } from '@server/learning/modules/submission/submission.repository';
import { AssignmentModule } from '@server/learning/modules/assignment/assignment.module';
import { SubmissionProfile } from '@server/learning/infrastructure/mappings/submission.profile';
import { SubmissionHandler } from '@server/learning/modules/submission/submission.handler';

/**
 * Submission Feature Module
 * Handles submission operations (BR-03 to BR-07)
 */
@Module({
  imports: [NatsClientModule, forwardRef(() => AssignmentModule)],
  controllers: [SubmissionHandler],
  providers: [SubmissionRepository, SubmissionService, SubmissionProfile],
  exports: [SubmissionService, SubmissionRepository],
})
export class SubmissionModule {}
