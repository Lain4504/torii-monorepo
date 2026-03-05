import { Module, forwardRef } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { CourseMasterService } from './course-master.service';
import { CourseMasterRepository } from './course-master.repository';
import { CourseProfile } from '@server/learning/infrastructure/mappings/course.profile';
import { ModuleModule } from '@server/learning/modules/module/module.module';
import { LessonModule } from '@server/learning/modules/lesson/lesson.module';
import { EnrollmentModule } from '@server/learning/modules/enrollment/enrollment.module';
import { COURSE_MASTER_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories';
import { COURSE_MASTER_SERVICE_TOKEN } from '@server/learning/interfaces/services';

import { CourseHandler } from './course.handler';

/**
 * Course Master Feature Module
 * Handles course master management operations
 */
@Module({
  controllers: [CourseHandler],
  imports: [
    NatsClientModule,
    forwardRef(() => ModuleModule),
    forwardRef(() => LessonModule),
    forwardRef(() => EnrollmentModule),
  ],
  providers: [
    {
      provide: COURSE_MASTER_REPOSITORY_TOKEN,
      useClass: CourseMasterRepository,
    },
    {
      provide: COURSE_MASTER_SERVICE_TOKEN,
      useClass: CourseMasterService,
    },
    CourseProfile,
  ],
  exports: [COURSE_MASTER_SERVICE_TOKEN, COURSE_MASTER_REPOSITORY_TOKEN],
})
export class CourseMasterModule {}
