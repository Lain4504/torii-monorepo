import { Module } from '@nestjs/common';
import { LessonHandler } from './lesson.handler';
import { LessonService } from './lesson.service';

@Module({
  controllers: [LessonHandler],
  providers: [LessonService],
  exports: [LessonService],
})
export class LessonModule {}
