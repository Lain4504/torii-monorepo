import { Module, forwardRef } from '@nestjs/common';
import { TeachingScheduleHandler } from '@server/learning/modules/teaching-schedule/teaching-schedule.handler';
import { SharedModule } from '@server/shared';
import { TeachingScheduleService } from '@server/learning/modules/teaching-schedule/teaching-schedule.service';
import { TeachingScheduleProfile } from '@server/learning/infrastructure/mappings/teaching-schedule.profile';
import { CourseMasterModule } from '@server/learning/modules/course-master/course-master.module';

@Module({
  imports: [SharedModule, forwardRef(() => CourseMasterModule)],
  controllers: [TeachingScheduleHandler],
  providers: [
    {
      provide: 'ITeachingScheduleService',
      useClass: TeachingScheduleService,
    },
    TeachingScheduleService,
    TeachingScheduleProfile,
  ],
  exports: [
    {
      provide: 'ITeachingScheduleService',
      useClass: TeachingScheduleService,
    },
    TeachingScheduleService,
  ],
})
export class TeachingScheduleModule {}
