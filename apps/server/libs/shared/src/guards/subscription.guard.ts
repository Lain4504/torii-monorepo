import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  private readonly logger = new Logger(SubscriptionGuard.name);

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const requester = request['requester'];

    if (!requester || !requester.sub) {
      this.logger.warn(
        '[SubscriptionGuard] No requester information found in request',
      );
      throw new ForbiddenException('Authentication required');
    }

    const userId = requester.sub;
    const now = new Date();

    // Check for active enrollment in a SUBSCRIPTION type offering
    const activeSubscription = await this.prisma.enrollment.findFirst({
      where: {
        userId,
        status: 'ACTIVE',
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        class: {
          offerings: {
            some: {
              type: 'SUBSCRIPTION',
            },
          },
        },
      },
      include: {
        class: {
          include: {
            offerings: true,
          },
        },
      },
    });

    if (!activeSubscription) {
      this.logger.warn(
        `[SubscriptionGuard] User ${userId} does not have an active subscription`,
      );
      throw new ForbiddenException(
        'Active subscription required to access this feature',
      );
    }

    // Attach subscription info to request for downstream use (e.g., quota checking)
    const subscriptionOffering = (
      activeSubscription.class as any
    ).offerings?.find((o: any) => o.type === 'SUBSCRIPTION');

    if (subscriptionOffering) {
      request['subscription'] = {
        id: activeSubscription.id,
        offeringId: subscriptionOffering.id,
        tier: subscriptionOffering.code, // Use code as tier identifier (e.g., 'plus', 'premium')
        metadata: subscriptionOffering.metadata,
      };
    }

    return true;
  }
}
