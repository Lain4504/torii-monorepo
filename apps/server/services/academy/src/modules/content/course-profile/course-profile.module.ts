import { Module } from '@nestjs/common';
import { CourseProfileHandler } from './course-profile.handler';
import { CourseProfileService } from './course-profile.service';

@Module({
  providers: [CourseProfileService],
  controllers: [CourseProfileHandler],
})
export class CourseProfileModule {}

