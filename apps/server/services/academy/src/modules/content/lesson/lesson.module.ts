import { Module } from '@nestjs/common';
import { LessonHandler } from './lesson.handler';
import { LessonService } from './lesson.service';

@Module({
  providers: [LessonService],
  controllers: [LessonHandler],
})
export class LessonModule {}

