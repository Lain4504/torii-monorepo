import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { LessonService } from './lesson.service';

@Module({
  imports: [NatsClientModule],
  controllers: [],
  providers: [LessonService],
  exports: [LessonService],
})
export class LessonModule { }
