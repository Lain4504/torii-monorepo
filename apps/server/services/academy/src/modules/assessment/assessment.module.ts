import { Module } from '@nestjs/common';
import { QuestionModule } from './question/question.module';
import { ExamModule } from './exam/exam.module';
import { ExamAttemptModule } from './exam-attempt/exam-attempt.module';
import { AssignmentSubmissionModule } from './assignment-submission/assignment-submission.module';

@Module({
  imports: [QuestionModule, ExamModule, ExamAttemptModule, AssignmentSubmissionModule],
})
export class AssessmentModule {}

