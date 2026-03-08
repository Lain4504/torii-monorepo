import { Module } from '@nestjs/common';
import { QuestionPoolHandler } from './question-pool.handler';
import { QuestionPoolService } from './question-pool.service';

@Module({
    controllers: [QuestionPoolHandler],
    providers: [QuestionPoolService],
    exports: [QuestionPoolService],
})
export class QuestionPoolModule { }
