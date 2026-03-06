import { Module } from '@nestjs/common';
import { QuestionHandler } from './question.handler';
import { QuestionService } from './question.service';

@Module({
  providers: [QuestionService],
  controllers: [QuestionHandler],
})
export class QuestionModule {}

