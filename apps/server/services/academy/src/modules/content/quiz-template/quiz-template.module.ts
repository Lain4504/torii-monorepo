import { Module } from '@nestjs/common';
import { QuizTemplateHandler } from './quiz-template.handler';
import { QuizTemplateService } from './quiz-template.service';

@Module({
  providers: [QuizTemplateService],
  controllers: [QuizTemplateHandler],
})
export class QuizTemplateModule {}

