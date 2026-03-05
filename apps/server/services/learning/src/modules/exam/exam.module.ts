import { Module } from '@nestjs/common';
import { SharedModule, NatsClientModule } from '@server/shared';
import { ExamService } from '@server/learning/modules/exam/exam.service';
import { ExamRepository } from '@server/learning/modules/exam/exam.repository';
import { EXAM_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories/i-exam.repository';
import { EXAM_SERVICE_TOKEN } from '@server/learning/interfaces/services/i-exam.service';
import { ExamProfile } from '@server/learning/infrastructure/mappings/exam.profile';

/**
 * Exam Feature Module
 * Handles exam/quiz management operations
 */
@Module({
  imports: [SharedModule, NatsClientModule],
  controllers: [],
  providers: [
    {
      provide: EXAM_REPOSITORY_TOKEN,
      useClass: ExamRepository,
    },
    {
      provide: EXAM_SERVICE_TOKEN,
      useClass: ExamService,
    },
    ExamProfile,
  ],
  exports: [EXAM_SERVICE_TOKEN, EXAM_REPOSITORY_TOKEN],
})
export class ExamModule {}
