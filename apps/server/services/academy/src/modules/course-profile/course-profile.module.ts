import { Module } from '@nestjs/common';
import { CourseProfileHandler } from './course-profile.handler';
import { CourseProfileService } from './course-profile.service';
import { CourseModuleService } from './course-module.service';
import { CourseModuleHandler } from './course-module.handler';

@Module({
  providers: [CourseProfileService, CourseModuleService],
  controllers: [CourseProfileHandler, CourseModuleHandler],
  exports: [CourseProfileService, CourseModuleService],
})
export class CourseProfileModule {}
