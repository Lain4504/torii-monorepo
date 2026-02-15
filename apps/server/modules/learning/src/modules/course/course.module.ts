import { Module, forwardRef } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { CourseService } from '@server/learning/modules/course/course.service';
import { CourseRepository } from '@server/learning/modules/course/course.repository';
import { CourseProfile } from '@server/learning/infrastructure/mappings/course.profile';
import { ModuleModule } from '@server/learning/modules/module/module.module';
import { LessonModule } from '@server/learning/modules/lesson/lesson.module';
import { EnrollmentModule } from '@server/learning/modules/enrollment/enrollment.module';
import { COURSE_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories';
import { COURSE_SERVICE_TOKEN } from '@server/learning/interfaces/services';

/**
 * Course Feature Module
 * Handles course management operations
 */
@Module({
  imports: [
    NatsClientModule,
    forwardRef(() => ModuleModule),
    forwardRef(() => LessonModule),
    forwardRef(() => EnrollmentModule),
  ],
  providers: [
    {
      provide: COURSE_REPOSITORY_TOKEN,
      useClass: CourseRepository,
    },
    {
      provide: COURSE_SERVICE_TOKEN,
      useClass: CourseService,
    },
    CourseProfile,
  ],
  exports: [COURSE_SERVICE_TOKEN, COURSE_REPOSITORY_TOKEN],
})
export class CourseModule { }

