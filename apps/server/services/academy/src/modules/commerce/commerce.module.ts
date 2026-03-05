import { Module } from '@nestjs/common';
import { CourseOfferingModule } from './course-offering/course-offering.module';

@Module({
  imports: [CourseOfferingModule],
})
export class CommerceModule {}

