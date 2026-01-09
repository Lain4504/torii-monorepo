import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { LessonService } from './lesson.service';
import { LessonRepository } from './lesson.repository';
import { LESSON_REPOSITORY_TOKEN } from '../../interfaces/repositories';
import { LESSON_SERVICE_TOKEN } from '../../interfaces/services';

/**
 * Lesson Feature Module
 * Handles lesson management operations
 */
@Module({
  imports: [NatsClientModule],
  providers: [
    {
      provide: LESSON_REPOSITORY_TOKEN,
      useClass: LessonRepository,
    },
    {
      provide: LESSON_SERVICE_TOKEN,
      useClass: LessonService,
    },
  ],
  exports: [LESSON_SERVICE_TOKEN, LESSON_REPOSITORY_TOKEN],
})
export class LessonModule { }
