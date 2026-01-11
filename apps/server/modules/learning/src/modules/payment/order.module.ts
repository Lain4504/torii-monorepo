import { Module } from '@nestjs/common';
import { PrismaModule } from '@server/shared';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { SePayService } from './sepay.service';
import { ORDER_SERVICE_TOKEN, ORDER_REPOSITORY_TOKEN } from '../../interfaces';
import { CourseModule } from '../course/course.module';
import { EnrollmentModule } from '../enrollment/enrollment.module';

/**
 * Order Module (Handling Orders and Payments)
 */
@Module({
    imports: [PrismaModule, CourseModule, EnrollmentModule],
    providers: [
        OrderService,
        SePayService,
        {
            provide: ORDER_SERVICE_TOKEN,
            useClass: OrderService,
        },
        OrderRepository,
        {
            provide: ORDER_REPOSITORY_TOKEN,
            useClass: OrderRepository,
        },
    ],
    exports: [ORDER_SERVICE_TOKEN, ORDER_REPOSITORY_TOKEN],
})
export class OrderModule { }
