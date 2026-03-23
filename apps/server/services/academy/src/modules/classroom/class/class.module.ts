import { Module } from '@nestjs/common';
import { ClassHandler } from './class.handler';
import { ClassService } from './class.service';
import { LiveClassCapacityService } from './live-class-capacity.service';
import { LiveScheduleModule } from '../live-schedule/live-schedule.module';
import { GamificationModule } from '../../gamification/gamification.module';

@Module({
  imports: [LiveScheduleModule, GamificationModule],
  providers: [ClassService, LiveClassCapacityService],
  controllers: [ClassHandler],
  exports: [ClassService, LiveClassCapacityService],
})
export class ClassModule {}
