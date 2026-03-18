import { Module } from '@nestjs/common';
import { CourseProfileHandler } from './course-profile.handler';
import { CourseProfileService } from './course-profile.service';
import { SyllabusService } from './syllabus.service';
import { SyllabusModuleService } from './syllabus-module.service';
import { SyllabusModuleHandler } from './syllabus-module.handler';

@Module({
  providers: [CourseProfileService, SyllabusService, SyllabusModuleService],
  controllers: [CourseProfileHandler, SyllabusModuleHandler],
  exports: [CourseProfileService, SyllabusService, SyllabusModuleService],
})
export class CourseProfileModule {}
