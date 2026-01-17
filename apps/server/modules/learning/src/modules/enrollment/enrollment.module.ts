import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule } from '@server/shared';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentRepository } from './enrollment.repository';
import { ENROLLMENT_SERVICE_TOKEN, ENROLLMENT_REPOSITORY_TOKEN } from '../../interfaces';
import { CourseModule } from '../course/course.module';

/**
 * Enrollment Module
 */
@Module({
    imports: [PrismaModule, forwardRef(() => CourseModule)],
    providers: [
        EnrollmentService,
        {
            provide: ENROLLMENT_SERVICE_TOKEN,
            useClass: EnrollmentService,
        },
        EnrollmentRepository,
        {
            provide: ENROLLMENT_REPOSITORY_TOKEN,
            useClass: EnrollmentRepository,
        },
    ],
    exports: [ENROLLMENT_SERVICE_TOKEN, ENROLLMENT_REPOSITORY_TOKEN],
})
export class EnrollmentModule { }

