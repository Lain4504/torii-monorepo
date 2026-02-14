import { Module, forwardRef } from '@nestjs/common';
import { PrismaModule, SharedModule, NatsClientModule } from '@server/shared';
import { CertificateService } from './certificate.service';
import { CertificateRepository } from './certificate.repository';
import { CertificateProfile } from '@server/learning/infrastructure/mappings/certificate.profile';

import { 
    CERTIFICATE_SERVICE_TOKEN, 
    CERTIFICATE_REPOSITORY_TOKEN 
} from '@server/learning/interfaces';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { CourseModule } from '../course/course.module';

/**
 * Certificate Module
 */
@Module({
    imports: [
        PrismaModule, 
        SharedModule,
        NatsClientModule,
        forwardRef(() => EnrollmentModule),
        forwardRef(() => CourseModule)
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

