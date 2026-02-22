import { Module, forwardRef } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { LessonService } from '@server/learning/modules/lesson/lesson.service';
import { LessonRepository } from '@server/learning/modules/lesson/lesson.repository';
import { LESSON_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories';
import { LESSON_SERVICE_TOKEN } from '@server/learning/interfaces/services';
import { CourseModule } from '@server/learning/modules/course/course.module';
import { ModuleModule } from '@server/learning/modules/module/module.module';
import { EnrollmentModule } from '@server/learning/modules/enrollment/enrollment.module';
import { LessonProfile } from '@server/learning/infrastructure/mappings/lesson.profile';

/**
 * Lesson Feature Module
 * Handles lesson management operations
 */
@Module({
  imports: [
    NatsClientModule,
    forwardRef(() => CourseModule),
    forwardRef(() => ModuleModule),
    forwardRef(() => EnrollmentModule),
  ],
  providers: [
    {
      provide: LESSON_REPOSITORY_TOKEN,
      useClass: LessonRepository,
    },
    {
      provide: LESSON_SERVICE_TOKEN,
      useClass: LessonService,
    },
    LessonProfile,
  ],
  exports: [LESSON_SERVICE_TOKEN, LESSON_REPOSITORY_TOKEN],
})
export class LessonModule { }

