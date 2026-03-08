import { Module } from '@nestjs/common';
import { ExamAttemptHandler } from './exam-attempt.handler';
import { ExamAttemptService } from './exam-attempt.service';
import { GamificationModule } from '../../gamification/gamification.module';

@Module({
  imports: [GamificationModule],
  providers: [ExamAttemptService],
  controllers: [ExamAttemptHandler],
  exports: [ExamAttemptService],
})
export class ExamAttemptModule { }

