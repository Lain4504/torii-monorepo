import { Module, forwardRef } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { AssignmentService } from '@server/learning/modules/assignment/assignment.service';
import { AssignmentRepository } from '@server/learning/modules/assignment/assignment.repository';
import { SubmissionModule } from '@server/learning/modules/submission/submission.module';
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
export class AssignmentModule { }

