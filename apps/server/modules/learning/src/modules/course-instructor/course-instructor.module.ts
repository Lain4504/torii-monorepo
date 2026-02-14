import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { CourseInstructorService } from './course-instructor.service';
import { CourseInstructorRepository } from './course-instructor.repository';
import { COURSE_INSTRUCTOR_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories';
import { COURSE_INSTRUCTOR_SERVICE_TOKEN } from '@server/learning/interfaces/services';

/**
 * Course Instructor Feature Module
 * Handles lecturer assignment to courses
 */
@Module({
    imports: [NatsClientModule],
    providers: [
        {
            provide: COURSE_INSTRUCTOR_REPOSITORY_TOKEN,
            useClass: CourseInstructorRepository,
        },
        {
            provide: COURSE_INSTRUCTOR_SERVICE_TOKEN,
            useClass: CourseInstructorService,
        },
    ],
    exports: [COURSE_INSTRUCTOR_SERVICE_TOKEN, COURSE_INSTRUCTOR_REPOSITORY_TOKEN],
})
export class CourseInstructorModule { }

