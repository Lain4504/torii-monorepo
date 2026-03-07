import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { ClassScheduleHandler } from './class-schedule.handler';
import { ClassScheduleService } from './class-schedule.service';

@Module({
  imports: [NatsClientModule],
  providers: [ClassScheduleService],
  controllers: [ClassScheduleHandler],
})
export class ClassScheduleModule { }

