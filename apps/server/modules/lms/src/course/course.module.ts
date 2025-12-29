import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';

import { CourseController } from './course.controller';
import { CourseService } from './course.service';

@Module({
  imports: [NatsClientModule],
  controllers: [CourseController],
  providers: [CourseService],
  exports: [CourseService],
})
export class CourseModule {}

