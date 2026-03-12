import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { REDIS_CLIENT } from '@server/shared/redis/redis.provider';
import Redis from 'ioredis';

export interface QuotaStatus {
    tier: string;
    limit: number;
    used: number;
    remaining: number;
    resetAt: string;
}

@Injectable()
export class QuotaService {
    private readonly logger = new Logger(QuotaService.name);

    // Default limits if not specified in CourseOffering metadata
    private readonly DEFAULT_LIMITS: Record<string, number> = {
        'free': 10,
        'plus': 100,
        'premium': 5000,
    };

    constructor(
        private readonly prisma: PrismaService,
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
    ) { }

    async checkAndConsume(userId: string, feature: string = 'ai_turns'): Promise<{ allowed: boolean; status: QuotaStatus }> {
        const status = await this.getStatus(userId, feature);

        if (status.limit !== -1 && status.used >= status.limit) {
            return { allowed: false, status };
        }

        // Increment usage in Redis
        const key = this.getUsageKey(userId, feature);
        const newUsed = await this.redis.incr(key);

        // Set expiration to 24 hours if it's a new key
        if (newUsed === 1) {
            await this.redis.expire(key, 86400); // 24 hours
        }

        status.used = newUsed;
        status.remaining = status.limit === -1 ? -1 : Math.max(0, status.limit - newUsed);

        return { allowed: true, status };
    }

    async getStatus(userId: string, feature: string = 'ai_turns'): Promise<QuotaStatus> {
        const tierInfo = await this.getUserTier(userId);
        const limit = tierInfo.metadata?.quotas?.[feature] ?? this.DEFAULT_LIMITS[tierInfo.tier] ?? 10;

        const key = this.getUsageKey(userId, feature);
        const usedRaw = await this.redis.get(key);
        const used = usedRaw ? parseInt(usedRaw, 10) : 0;

        const tomorrow = new Date();
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        tomorrow.setUTCHours(0, 0, 0, 0);

        return {
            tier: tierInfo.tier,
            limit,
            used,
            remaining: limit === -1 ? -1 : Math.max(0, limit - used),
            resetAt: tomorrow.toISOString(),
        };
    }

    private async getUserTier(userId: string): Promise<{ tier: string; metadata: any }> {
        const now = new Date();
        const activeSubscription = await this.prisma.enrollment.findFirst({
            where: {
                userId,
                status: 'ACTIVE',
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: now } },
                ],
                class: {
                    offeringLinks: {
                        some: {
                            offering: {
                                type: 'SUBSCRIPTION',
                            },
                        },
                    },
                },
            },
            include: {
                class: {
                    include: {
                        offeringLinks: {
                            include: {
                                offering: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                enrolledAt: 'desc',
            },
        });

        if (!activeSubscription) {
            return { tier: 'free', metadata: {} };
        }

        const offering = activeSubscription.class.offeringLinks
            .find(oc => oc.offering.type === 'SUBSCRIPTION')?.offering;

        const offeringMetadata = (offering as any)?.metadata;

        return {
            tier: offering?.code || 'free',
            metadata: offeringMetadata || {},
        };
    }

    private getUsageKey(userId: string, feature: string): string {
        const dateStr = new Date().toISOString().split('T')[0];
        return `quota:${userId}:${feature}:${dateStr}`;
    }
}
