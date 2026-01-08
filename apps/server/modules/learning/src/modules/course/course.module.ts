import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { CourseService } from './course.service';
import { CourseRepository } from './course.repository';
import { COURSE_REPOSITORY_TOKEN } from '../../interfaces/repositories';
import { COURSE_SERVICE_TOKEN } from '../../interfaces/services';

/**
 * Course Feature Module
 * Handles course management operations
 */
@Module({
  imports: [NatsClientModule],
  providers: [
    {
      provide: COURSE_REPOSITORY_TOKEN,
      useClass: CourseRepository,
    },
    {
      provide: COURSE_SERVICE_TOKEN,
      useClass: CourseService,
    },
  ],
  exports: [COURSE_SERVICE_TOKEN, COURSE_REPOSITORY_TOKEN],
})
export class CourseModule { }
