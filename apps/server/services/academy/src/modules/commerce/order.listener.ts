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
  ) {}

  @EventPattern('order.paid')
  async handleOrderPaid(@Payload() data: { orderId: string }) {
    console.log('[Academy] Order paid event received:', data);

    const order = await this.prisma.order.findUnique({
      where: { id: data.orderId },
      include: { items: true },
    });

    if (!order || order.status !== 'PAID') {
      console.log(`[Academy] Order ${data.orderId} not found or not PAID. Ignoring.`);
      return;
    }

    let enrolledCount = 0;
    for (const item of order.items) {
      const isVod = !!item.vodPackageId;
      const isCohort = !!item.cohortId;

      if (!isVod && !isCohort) continue;

      const snapshot = item.offeringSnapshot as any;
      let targetLiveClassId: string | undefined = undefined;

      if (isCohort) {
        targetLiveClassId = snapshot?.selectedClassId;
        if (!targetLiveClassId) continue;
      }

      try {
        await this.enrollments.enroll(
          {
            userId: order.userId,
            vodPackageId: item.vodPackageId ?? undefined,
            liveClassId: targetLiveClassId,
            status: 'ACTIVE',
            sourceOrderId: order.id,
          },
          'SYSTEM',
        );
        enrolledCount++;
      } catch (err: any) {
        console.error(`[Academy] Failed to enroll user ${order.userId}:`, err.message);
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
