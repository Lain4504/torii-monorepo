import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { CourseService } from './course.service';

@Module({
  imports: [NatsClientModule],
  controllers: [],
  providers: [CourseService],
  exports: [CourseService],
})
export class CourseModule { }

