import { Module } from '@nestjs/common';
import { CourseProfileModule } from './course-profile/course-profile.module';

@Module({
  imports: [CourseProfileModule],
})
export class ContentModule {}

