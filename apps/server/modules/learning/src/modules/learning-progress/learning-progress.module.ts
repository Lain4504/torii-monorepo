import { Module } from '@nestjs/common';
import { PrismaModule, NatsClientModule } from '@server/shared';
import { LearningProgressController } from './learning-progress.controller';
import { LearningProgressService } from './learning-progress.service';
import { LearningProgressRepository } from './learning-progress.repository';
import { EnrollmentRepository } from '../enrollment/enrollment.repository';
import { CourseRepository } from '../course/course.repository';
import { LessonRepository } from '../lesson/lesson.repository';
import { ModuleRepository } from '../module/module.repository';

import { LEARNING_PROGRESS_SERVICE_TOKEN } from '../../interfaces/services';
import {
    LEARNING_PROGRESS_REPOSITORY_TOKEN,
    ENROLLMENT_REPOSITORY_TOKEN,
    COURSE_REPOSITORY_TOKEN,
    LESSON_REPOSITORY_TOKEN,
    MODULE_REPOSITORY_TOKEN
} from '../../interfaces/repositories';

@Module({
    imports: [PrismaModule, NatsClientModule],
    controllers: [LearningProgressController],
    providers: [
        {
            provide: LEARNING_PROGRESS_SERVICE_TOKEN,
            useClass: LearningProgressService,
        },
        {
            provide: LEARNING_PROGRESS_REPOSITORY_TOKEN,
            useClass: LearningProgressRepository,
        },
        {
            provide: ENROLLMENT_REPOSITORY_TOKEN,
            useClass: EnrollmentRepository,
        },
        {
            provide: COURSE_REPOSITORY_TOKEN,
            useClass: CourseRepository,
        },
        {
            provide: LESSON_REPOSITORY_TOKEN,
            useClass: LessonRepository,
        },
        {
            provide: MODULE_REPOSITORY_TOKEN,
            useClass: ModuleRepository,
        }
    ],
    exports: [LEARNING_PROGRESS_SERVICE_TOKEN]
})
export class LearningProgressModule { }
