import { Module } from '@nestjs/common';
import { PrismaModule } from '@server/shared';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './payment.repository';
import { SePayService } from './sepay.service';
import { PAYMENT_SERVICE_TOKEN, PAYMENT_REPOSITORY_TOKEN } from '../../interfaces';
import { CourseModule } from '../course/course.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';

/**
 * Payment Module
 */
@Module({
    imports: [PrismaModule, CourseModule, EnrollmentModule],
    providers: [
        PaymentService,
        SePayService,
        {
            provide: PAYMENT_SERVICE_TOKEN,
            useClass: PaymentService,
        },
        PaymentRepository,
        {
            provide: PAYMENT_REPOSITORY_TOKEN,
            useClass: PaymentRepository,
        },
    ],
    exports: [PAYMENT_SERVICE_TOKEN, PAYMENT_REPOSITORY_TOKEN],
})
export class PaymentModule { }

