import { Module } from '@nestjs/common';
import { CourseProfileHandler } from './course-profile.handler';
import { CourseProfileService } from './course-profile.service';
import { SyllabusService } from './syllabus.service';

@Module({
  providers: [CourseProfileService, SyllabusService],
  controllers: [CourseProfileHandler],
  exports: [CourseProfileService, SyllabusService],
})
export class CourseProfileModule { }

