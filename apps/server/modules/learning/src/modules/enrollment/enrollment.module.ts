import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule, NatsClientModule } from '@server/shared';
import { EnrollmentService } from '@server/learning/modules/enrollment/enrollment.service';
import { EnrollmentRepository } from '@server/learning/modules/enrollment/enrollment.repository';
import { EnrollmentExpirationScheduler } from '@server/learning/modules/enrollment/enrollment-expiration.scheduler';
import { EnrollmentProfile } from '@server/learning/infrastructure/mappings/enrollment.profile';

import { ENROLLMENT_SERVICE_TOKEN, ENROLLMENT_REPOSITORY_TOKEN } from '@server/learning/interfaces';
import { CourseMasterModule } from '@server/learning/modules/course-master/course-master.module';
import { LessonModule } from '@server/learning/modules/lesson/lesson.module';
import { CertificateModule } from '@server/learning/modules/certificate/certificate.module';

import { EnrollmentController } from './enrollment.controller';

/**
 * Enrollment Module
 */
@Module({
    imports: [
        PrismaModule,
        NatsClientModule,
        forwardRef(() => CourseMasterModule),
        forwardRef(() => CertificateModule),
        forwardRef(() => LessonModule)
    ],
    controllers: [EnrollmentController],
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
        EnrollmentExpirationScheduler,
        EnrollmentProfile,
    ],
    exports: [ENROLLMENT_SERVICE_TOKEN, ENROLLMENT_REPOSITORY_TOKEN],
})
export class EnrollmentModule { }


