import { Module } from '@nestjs/common';
import { CourseRunService } from './course-run.service';
import { CourseRunRepository } from './course-run.repository';
import { COURSE_RUN_REPOSITORY_TOKEN } from '../../interfaces/repositories';
import { CourseMasterModule } from '../course-master/course-master.module';
import { NatsClientModule } from '@server/shared';

@Module({
    imports: [CourseMasterModule, NatsClientModule],
    providers: [
        CourseRunService,
        {
            provide: COURSE_RUN_REPOSITORY_TOKEN,
            useClass: CourseRunRepository,
        },
    ],
    exports: [CourseRunService, COURSE_RUN_REPOSITORY_TOKEN],
})
export class CourseRunModule { }
