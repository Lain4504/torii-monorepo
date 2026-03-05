import { Module } from '@nestjs/common';
import { ClassScheduleHandler } from './class-schedule.handler';
import { ClassScheduleService } from './class-schedule.service';

@Module({
  providers: [ClassScheduleService],
  controllers: [ClassScheduleHandler],
})
export class ClassScheduleModule {}

