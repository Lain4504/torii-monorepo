import { Module } from '@nestjs/common';
import { ExamHandler } from './exam.handler';
import { ExamService } from './exam.service';

@Module({
  providers: [ExamService],
  controllers: [ExamHandler],
})
export class ExamModule {}

