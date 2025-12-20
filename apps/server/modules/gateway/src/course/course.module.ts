import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';

import { CourseController } from './course.controller';

@Module({
  imports: [NatsClientModule],
  controllers: [CourseController],
})
export class CourseModule { }
