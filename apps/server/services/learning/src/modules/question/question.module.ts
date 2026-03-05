import { Module } from '@nestjs/common';
import { QuestionHandler } from '@server/learning/modules/question/question.handler';
import { SharedModule } from '@server/shared';
import { QuestionService } from '@server/learning/modules/question/question.service';
import { QuestionRepository } from '@server/learning/modules/question/question.repository';
import { QUESTION_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories/i-question.repository';
import { QUESTION_SERVICE_TOKEN } from '@server/learning/interfaces/services/i-question.service';
import { QuestionProfile } from '@server/learning/infrastructure/mappings/question.profile';

/**
 * Question Feature Module
 * Handles question management operations
 */
@Module({
  imports: [SharedModule],
  controllers: [QuestionHandler],
  providers: [
    {
      provide: QUESTION_REPOSITORY_TOKEN,
      useClass: QuestionRepository,
    },
    {
      provide: QUESTION_SERVICE_TOKEN,
      useClass: QuestionService,
    },
    QuestionProfile,
  ],
  exports: [QUESTION_SERVICE_TOKEN, QUESTION_REPOSITORY_TOKEN],
})
export class QuestionModule {}
