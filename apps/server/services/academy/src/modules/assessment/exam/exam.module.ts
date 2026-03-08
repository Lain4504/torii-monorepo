import { Module } from '@nestjs/common';
import { ExamHandler } from './exam.handler';
import { ExamService } from './exam.service';

import { QuestionPoolModule } from '../question-pool/question-pool.module';

@Module({
  imports: [QuestionPoolModule],
  providers: [ExamService],
  controllers: [ExamHandler],
  exports: [ExamService],
})
export class ExamModule { }

