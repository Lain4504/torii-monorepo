import { Module, forwardRef } from '@nestjs/common';
import { CourseRunHandler } from '@server/learning/modules/course-run/course-run.handler';
import { CourseRunService } from './course-run.service';
import { CourseRunRepository } from './course-run.repository';
import { COURSE_RUN_SERVICE_TOKEN, COURSE_RUN_REPOSITORY_TOKEN } from '../../interfaces';
import { CourseMasterModule } from '../course-master/course-master.module';
import { NatsClientModule } from '@server/shared';

@Module({
    imports: [forwardRef(() => CourseMasterModule), NatsClientModule],
  controllers: [CourseRunHandler],
    providers: [
        {
            provide: COURSE_RUN_SERVICE_TOKEN,
            useClass: CourseRunService,
        },
        {
            provide: COURSE_RUN_REPOSITORY_TOKEN,
            useClass: CourseRunRepository,
        },
    ],
    exports: [COURSE_RUN_SERVICE_TOKEN, COURSE_RUN_REPOSITORY_TOKEN],
})
export class CourseRunModule { }
