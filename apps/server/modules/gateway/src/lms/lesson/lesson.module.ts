import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { LessonController } from './lesson.controller';

@Module({
  imports: [NatsClientModule],
  controllers: [LessonController],
})
export class LessonModule {}
