import { Module } from '@nestjs/common';
import { SharedModule } from '@server/shared';
import { QuestionPoolService } from '@server/learning/modules/question-pool/question-pool.service';
import { QuestionPoolRepository } from '@server/learning/modules/question-pool/question-pool.repository';
import { QUESTION_POOL_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories/i-question-pool.repository';
import { QUESTION_POOL_SERVICE_TOKEN } from '@server/learning/interfaces/services/i-question-pool.service';

/**
 * Question Pool Feature Module
 * Handles question pool management operations
 */
@Module({
    imports: [SharedModule],
    providers: [
        {
            provide: QUESTION_POOL_REPOSITORY_TOKEN,
            useClass: QuestionPoolRepository,
        },
        {
            provide: QUESTION_POOL_SERVICE_TOKEN,
            useClass: QuestionPoolService,
        },
    ],
    exports: [QUESTION_POOL_SERVICE_TOKEN, QUESTION_POOL_REPOSITORY_TOKEN],
})
export class QuestionPoolModule { }


