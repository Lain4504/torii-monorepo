import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule, SharedModule, NatsClientModule } from '@server/shared';
import { CertificateService } from '@server/learning/modules/certificate/certificate.service';
import { CertificateRepository } from '@server/learning/modules/certificate/certificate.repository';
import { CertificateProfile } from '@server/learning/infrastructure/mappings/certificate.profile';

import {
    CERTIFICATE_SERVICE_TOKEN,
    CERTIFICATE_REPOSITORY_TOKEN
} from '@server/learning/interfaces';
import { EnrollmentModule } from '@server/learning/modules/enrollment/enrollment.module';
import { CourseMasterModule } from '@server/learning/modules/course-master/course-master.module';
import { CourseRunModule } from '@server/learning/modules/course-run/course-run.module';

/**
 * Certificate Module
 */
@Module({
    imports: [
        PrismaModule,
        SharedModule,
        NatsClientModule,
        forwardRef(() => EnrollmentModule),
        forwardRef(() => CourseMasterModule),
        forwardRef(() => CourseRunModule)
    ],
    controllers: [],
    providers: [
        CertificateService,
        {
            provide: CERTIFICATE_SERVICE_TOKEN,
            useClass: CertificateService,
        },
        CertificateRepository,
        {
            provide: CERTIFICATE_REPOSITORY_TOKEN,
            useClass: CertificateRepository,
        },
        CertificateProfile,
    ],
    exports: [CERTIFICATE_SERVICE_TOKEN, CERTIFICATE_REPOSITORY_TOKEN],
})
export class CertificateModule { }

