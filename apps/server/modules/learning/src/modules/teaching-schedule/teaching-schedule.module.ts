import { Module } from '@nestjs/common';
import { TeachingScheduleService } from './teaching-schedule.service';

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
