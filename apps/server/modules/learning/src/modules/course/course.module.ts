import { Module, forwardRef } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { CourseService } from './course.service';
import { CourseRepository } from './course.repository';
import { CourseProfile } from '../../infrastructure/mappings/course.profile';
import { ModuleModule } from '../module/module.module';
import { LessonModule } from '../lesson/lesson.module';
import { COURSE_REPOSITORY_TOKEN } from '../../interfaces/repositories';
import { COURSE_SERVICE_TOKEN } from '../../interfaces/services';

/**
 * Course Feature Module
 * Handles course management operations
 */
@Module({
  imports: [
    NatsClientModule,
    forwardRef(() => ModuleModule),
    forwardRef(() => LessonModule),
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
