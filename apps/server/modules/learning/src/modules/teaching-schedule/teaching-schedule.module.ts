import { Module, forwardRef } from '@nestjs/common';
import { SharedModule } from '@server/shared';
import { TeachingScheduleService } from '@server/learning/modules/teaching-schedule/teaching-schedule.service';
import { TeachingScheduleProfile } from '@server/learning/infrastructure/mappings/teaching-schedule.profile';
import { CourseModule } from '@server/learning/modules/course/course.module';

@Module({
    imports: [SharedModule, forwardRef(() => CourseModule)],
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
export class TeachingScheduleModule { }
