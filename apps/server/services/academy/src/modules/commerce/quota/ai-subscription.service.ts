import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';

@Injectable()
export class AiSubscriptionService {
    private readonly logger = new Logger(AiSubscriptionService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Get the currently active subscription for a user.
     * Returns null if no active subscription (user is on Free tier).
     */
    async getActiveSubscription(userId: string) {
        const now = new Date();
        return this.prisma.aiUserSubscription.findFirst({
            where: {
                userId,
                status: 'ACTIVE',
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: now } },
                ],
            },
            include: { plan: true },
            orderBy: { startedAt: 'desc' },
        });
    }

    /**
     * Get all subscription plans visible to users.
     */
    async getPlans() {
        return this.prisma.aiSubscriptionPlan.findMany({
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
        });
    }

    /**
     * Activate a subscription plan for a user after payment.
     */
    async activateSubscription(userId: string, planId: string, sourceOrderId?: string) {
        // Expire all existing ACTIVE subscriptions for this user
        await this.prisma.aiUserSubscription.updateMany({
            where: { userId, status: 'ACTIVE' },
            data: { status: 'EXPIRED' },
        });

        // Create the new subscription
        const plan = await this.prisma.aiSubscriptionPlan.findUniqueOrThrow({
            where: { id: planId },
        });

        const expiresAt = plan.billingCycle === 'LIFETIME'
            ? null
            : plan.billingCycle === 'YEARLY'
                ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days for MONTHLY

        return this.prisma.aiUserSubscription.create({
            data: {
                userId,
                planId,
                status: 'ACTIVE',
                startedAt: new Date(),
                expiresAt,
                sourceOrderId: sourceOrderId ?? null,
            },
            include: { plan: true },
        });
    }
}
