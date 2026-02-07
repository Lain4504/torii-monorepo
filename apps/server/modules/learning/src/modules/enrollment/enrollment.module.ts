import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule, NatsClientModule } from '@server/shared';
import { EnrollmentService } from './enrollment.service';
import { EnrollmentRepository } from './enrollment.repository';

import { ENROLLMENT_SERVICE_TOKEN, ENROLLMENT_REPOSITORY_TOKEN } from '../../interfaces';
import { CourseModule } from '../course/course.module';
import { CertificateModule } from '../certificate/certificate.module';

/**
 * Enrollment Module
 */
@Module({
    imports: [
        PrismaModule, 
        NatsClientModule, 
        forwardRef(() => CourseModule),
        forwardRef(() => CertificateModule)
    ],
    controllers: [],
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

