import { Module } from '@nestjs/common';
import { CourseOfferingHandler } from './course-offering.handler';
import { CourseOfferingService } from './course-offering.service';

@Module({
  providers: [CourseOfferingService],
  controllers: [CourseOfferingHandler],
})
export class CourseOfferingModule {}
