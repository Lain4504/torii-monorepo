import { Module } from '@nestjs/common';
import { TeachingScheduleService } from '@server/learning/modules/teaching-schedule/teaching-schedule.service';

@Module({
    providers: [
        {
            provide: 'ITeachingScheduleService',
            useClass: TeachingScheduleService,
        },
        TeachingScheduleService,
    ],
    exports: [
        {
            provide: 'ITeachingScheduleService',
            useClass: TeachingScheduleService,
        },
        TeachingScheduleService,
    ],
})
export class TeachingScheduleModule { }
