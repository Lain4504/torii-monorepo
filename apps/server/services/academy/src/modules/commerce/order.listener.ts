import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { EnrollmentService } from '../classroom/enrollment/enrollment.service';

@Controller()
export class OrderListener {
    constructor(
        private readonly prisma: PrismaService,
        private readonly enrollments: EnrollmentService,
    ) { }

    @EventPattern('order.paid')
    async handleOrderPaid(@Payload() data: { userId: string; offeringId: string; metadata?: any }) {
        console.log('[Academy] Order paid event received:', data);

        const offering = await this.prisma.courseOffering.findUnique({
            where: { id: data.offeringId },
            include: { classes: { include: { class: true } } },
        });

        if (!offering) {
            console.warn(`[Academy] Offering not found for order.paid: ${data.offeringId}`);
            return;
        }

        // Find suitable classes (e.g., active/enrolling)
        const activeClasses = offering.classes
            .map((oc: any) => oc.class)
            .filter((c: any) => c.status === 'ENROLLING' || c.status === 'IN_PROGRESS');

        if (activeClasses.length === 0) {
            console.warn(`[Academy] No active/enrolling classes found for offering: ${offering.id}`);
            return;
        }

        for (const klass of activeClasses) {
            try {
                await this.enrollments.create({
                    classId: klass.id,
                    userId: data.userId,
                    status: 'ACTIVE',
                    sourceOfferingId: offering.id,
                });
                console.log(`[Academy] Enrolled user ${data.userId} into class ${klass.id}`);
            } catch (error) {
                console.error(`[Academy] Failed to enroll user ${data.userId} into class ${klass.id}:`, error.message);
            }
        }
    }
}
