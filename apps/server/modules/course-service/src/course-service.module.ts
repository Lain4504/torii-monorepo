import { Module } from '@nestjs/common';
import { PrismaModule } from '@server/shared';

import { CourseModule } from './course/course.module';

@Module({
  imports: [
    PrismaModule, // Sử dụng PrismaModule từ shared library
    CourseModule,
  ],
})
export class CourseServiceModule {}


