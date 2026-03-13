import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { EnrollmentService } from '../classroom/enrollment/enrollment.service';
import { AuditLoggerService } from '../audit-logger.service';
import { ClassStatus } from '@prisma/generated';

@Controller()
export class OrderListener {
    constructor(
        private readonly prisma: PrismaService,
        private readonly enrollments: EnrollmentService,
        private readonly audit: AuditLoggerService,
    ) { }

    @EventPattern('order.paid')
    async handleOrderPaid(@Payload() data: { orderId: string }) {
        console.log('[Academy] Order paid event received:', data);

        const order = await this.prisma.order.findUnique({
            where: { id: data.orderId },
            include: {
                items: {
                    include: {
                        offering: {
                            include: {
                                classes: {
                                    include: {
                                        class: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!order || order.status !== 'PAID') {
            console.log(`[Academy] Order ${data.orderId} not found or not PAID. Ignoring.`);
            return;
        }

        let enrolledCount = 0;
        for (const item of order.items) {
            if (!item.offering || !item.offering.classes) continue;

            for (const occ of item.offering.classes) {
                const klass = occ.class;

                // Rule: Enroll only when LIVE class is OPENING or ONGOING
                if (klass.status !== ClassStatus.OPENING && klass.status !== ClassStatus.ONGOING) {
                    console.log(`[Academy] Skip enroll: Class ${klass.id} is ${klass.status}`);
                    continue;
                }

                try {
                    await this.enrollments.create({
                        userId: order.userId,
                        offeringId: item.offeringId ?? undefined,
                        classId: klass.id,
                        status: 'ACTIVE',
                        sourceOrderId: order.id,
                    }, 'SYSTEM');
                    enrolledCount++;
                } catch (err: any) {
                    // Ignore duplicate enrollment error or full class silently or log
                    console.error(`[Academy] Failed to enroll user ${order.userId} in class ${klass.id}:`, err.message);
                }
            }
        }

        console.log(`[Academy] Order ${order.id} paid. Created ${enrolledCount} enrollments.`);
    }

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
