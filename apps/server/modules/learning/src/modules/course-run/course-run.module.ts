import { Module } from '@nestjs/common';
import { CourseRunService } from './course-run.service';
import { CourseRunRepository } from './course-run.repository';
import { COURSE_RUN_REPOSITORY_TOKEN } from '../../interfaces/repositories';
import { CourseModule } from '../course/course.module';

@Module({
    imports: [CourseModule],
    providers: [
        CourseRunService,
        {
            provide: COURSE_RUN_REPOSITORY_TOKEN,
            useClass: CourseRunRepository,
        },
    ],
    exports: [CourseRunService],
})
export class CourseRunModule { }
