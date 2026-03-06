import { Module } from '@nestjs/common';
import { ExamAttemptHandler } from './exam-attempt.handler';
import { ExamAttemptService } from './exam-attempt.service';

@Module({
  providers: [ExamAttemptService],
  controllers: [ExamAttemptHandler],
  exports: [ExamAttemptService],
})
export class ExamAttemptModule { }

