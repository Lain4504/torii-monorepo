import { Module, forwardRef } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { AssignmentService } from './assignment.service';
import { AssignmentRepository } from './assignment.repository';
import { SubmissionModule } from '../submission/submission.module';
import { AssignmentProfile } from '@server/learning/infrastructure/mappings/assignment.profile';

/**
 * Assignment Feature Module
 * Handles assignment management operations (BR-01, BR-02)
 */
@Module({
  imports: [
    NatsClientModule,
    forwardRef(() => SubmissionModule),
  ],
  providers: [
    AssignmentRepository,
    AssignmentService,
    AssignmentProfile,
  ],
  exports: [AssignmentService, AssignmentRepository],
})
export class AssignmentModule {}

