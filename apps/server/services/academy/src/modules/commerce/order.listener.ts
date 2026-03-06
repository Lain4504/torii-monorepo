import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { EnrollmentService } from '../classroom/enrollment/enrollment.service';
import { AuditLoggerService } from '../audit-logger.service';

@Controller()
export class OrderListener {
    constructor(
        private readonly prisma: PrismaService,
        private readonly enrollments: EnrollmentService,
        private readonly audit: AuditLoggerService,
    ) { }

    @EventPattern('order.refunded')
    async handleOrderRefunded(@Payload() data: { orderId: string }) {
        console.log('[Academy] Order refunded event received:', data);

        const enrollments = await this.prisma.enrollment.findMany({
            where: { sourceOrderId: data.orderId, status: 'ACTIVE' },
        });

        for (const enrollment of enrollments) {
            await this.prisma.enrollment.update({
                where: { id: enrollment.id },
                data: { status: 'CANCELLED' },
            });

            await this.audit.log({
                userId: 'SYSTEM',
                action: 'enrollment.refund_revocation',
                entity: 'Enrollment',
                entityId: enrollment.id,
                description: `Cancelled enrollment ${enrollment.id} due to order refund ${data.orderId}`,
                metadata: { orderId: data.orderId },
            });
            console.log(`[Academy] Cancelled enrollment ${enrollment.id} due to refund`);
        }
    }
}
