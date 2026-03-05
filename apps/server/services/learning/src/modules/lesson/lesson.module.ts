import { Module, forwardRef } from '@nestjs/common';
import { LessonHandler } from '@server/learning/modules/lesson/lesson.handler';
import { NatsClientModule } from '@server/shared';
import { LessonService } from '@server/learning/modules/lesson/lesson.service';
import { LessonRepository } from '@server/learning/modules/lesson/lesson.repository';
import { LESSON_REPOSITORY_TOKEN, MODULE_ITEM_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories';
import { ModuleItemRepository } from '@server/learning/modules/module/module-item.repository';
import { LESSON_SERVICE_TOKEN } from '@server/learning/interfaces/services';
import { CourseMasterModule } from '@server/learning/modules/course-master/course-master.module';
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
    forwardRef(() => CourseMasterModule),
    forwardRef(() => ModuleModule),
    forwardRef(() => EnrollmentModule),
  ],
  controllers: [LessonHandler],
  providers: [
    {
      provide: LESSON_REPOSITORY_TOKEN,
      useClass: LessonRepository,
    },
    {
      provide: LESSON_SERVICE_TOKEN,
      useClass: LessonService,
    },
    {
      provide: MODULE_ITEM_REPOSITORY_TOKEN,
      useClass: ModuleItemRepository,
    },
    LessonProfile,
  ],
  exports: [LESSON_SERVICE_TOKEN, LESSON_REPOSITORY_TOKEN],
})
export class LessonModule { }

