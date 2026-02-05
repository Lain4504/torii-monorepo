import { Module, forwardRef } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { SubmissionService } from './submission.service';
import { SubmissionRepository } from './submission.repository';
import { AssignmentModule } from '../assignment/assignment.module';
import { SubmissionProfile } from '../../infrastructure/mappings/submission.profile';

/**
 * Submission Feature Module
 * Handles submission operations (BR-03 to BR-07)
 */
@Module({
  imports: [
    NatsClientModule,
    forwardRef(() => AssignmentModule),
  ],
  providers: [
    SubmissionRepository,
    SubmissionService,
    SubmissionProfile,
  ],
  exports: [SubmissionService, SubmissionRepository],
})
export class SubmissionModule {}
