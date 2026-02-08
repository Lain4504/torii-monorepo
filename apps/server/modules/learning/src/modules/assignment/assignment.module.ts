import { Module, forwardRef } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { AssignmentService } from './assignment.service';
import { AssignmentRepository } from './assignment.repository';
import { AssignmentProfile } from '../../infrastructure/mappings/assignment.profile';
import { SubmissionModule } from '../submission/submission.module';

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
