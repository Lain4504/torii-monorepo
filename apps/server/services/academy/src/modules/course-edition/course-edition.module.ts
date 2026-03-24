import { Module } from '@nestjs/common';
import { CourseEditionHandler } from './course-edition.handler';
import { CourseEditionService } from './course-edition.service';

@Module({
  providers: [CourseEditionService],
  controllers: [CourseEditionHandler],
  exports: [CourseEditionService],
})
export class CourseEditionModule {}

