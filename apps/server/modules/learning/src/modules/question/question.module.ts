import { Module } from '@nestjs/common';
import { SharedModule } from '@server/shared';
import { QuestionService } from '@server/learning/modules/question/question.service';
import { QuestionRepository } from '@server/learning/modules/question/question.repository';
import { QUESTION_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories/i-question.repository';
import { QUESTION_SERVICE_TOKEN } from '@server/learning/interfaces/services/i-question.service';

/**
 * Question Feature Module
 * Handles question management operations
 */
@Module({
    imports: [SharedModule],
    providers: [
        {
            provide: QUESTION_REPOSITORY_TOKEN,
            useClass: QuestionRepository,
        },
        {
            provide: QUESTION_SERVICE_TOKEN,
            useClass: QuestionService,
        },
    ],
    exports: [QUESTION_SERVICE_TOKEN, QUESTION_REPOSITORY_TOKEN],
})
export class QuestionModule { }


