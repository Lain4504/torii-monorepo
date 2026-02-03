import { Module } from '@nestjs/common';
import { SharedModule, NatsClientModule } from '@server/shared';
import { ExamService } from './exam.service';
import { ExamRepository } from './exam.repository';
import { EXAM_REPOSITORY_TOKEN } from '../../interfaces/repositories/i-exam.repository';
import { EXAM_SERVICE_TOKEN } from '../../interfaces/services/i-exam.service';

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
    ],
    exports: [EXAM_SERVICE_TOKEN, EXAM_REPOSITORY_TOKEN],
})
export class ExamModule { }










