import { Module } from '@nestjs/common';
import { CourseOfferingHandler } from './course-offering.handler';
import { CourseOfferingService } from './course-offering.service';
import { ClassModule } from '../../classroom/class/class.module';

@Module({
  imports: [ClassModule],
  providers: [CourseOfferingService],
  controllers: [CourseOfferingHandler],
})
export class CourseOfferingModule {}
