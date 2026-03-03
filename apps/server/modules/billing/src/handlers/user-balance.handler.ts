import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { UserBalanceService } from '@server/billing/modules/user-balance/user-balance.service';
import { FeatureQuotaService } from '@server/billing/modules/user-balance/feature-quota.service';

@Controller()
export class UserBalanceHandler {
    private readonly logger = new Logger(UserBalanceHandler.name);

    constructor(
        private readonly userBalanceService: UserBalanceService,
        private readonly featureQuotaService: FeatureQuotaService,
    ) { }

    @MessagePattern({ cmd: 'billing.user_balance.get' })
    async getBalance(@Payload() data: { userId: string }) {
        return this.userBalanceService.getBalance(data.userId);
    }

    @MessagePattern({ cmd: 'billing.user_balance.add' })
    async addBalance(@Payload() data: { userId: string, amount: number, reason: string, type?: any, metadata?: any }) {
        return this.userBalanceService.addBalance(data.userId, data.amount, data.reason, data.type, data.metadata);
    }

    @MessagePattern({ cmd: 'billing.user_balance.deduct' })
    async deductBalance(@Payload() data: { userId: string, amount: number, reason: string, type?: any, metadata?: any }) {
        return this.userBalanceService.deductBalance(data.userId, data.amount, data.reason, data.type, data.metadata);
    }

    @MessagePattern({ cmd: 'billing.user_balance.getHistory' })
    async getHistory(@Payload() data: { userId: string, page: number, limit: number, type?: any, aiOnly?: any }) {
        const { userId, ...query } = data;
        return this.userBalanceService.getHistory(userId, query);
    }

    @MessagePattern({ cmd: 'billing.quota.checkAndConsume' })
    async checkAndConsumeUsage(@Payload() data: { userId: string, featureType: 'roleplay' | 'live' }) {
        return this.featureQuotaService.checkAndConsumeQuota(data.userId, data.featureType);
    }

    @MessagePattern({ cmd: 'billing.quota.getStatus' })
    async getQuotaStatus(@Payload() data: { userId: string, featureType: 'roleplay' | 'live' }) {
        return this.featureQuotaService.getQuotaStatus(data.userId, data.featureType);
    }

    @MessagePattern({ cmd: 'billing.quota.recordTokenUsage' })
    async recordTokenUsage(@Payload() data: { userId: string, taskType: string, usage: any }) {
        return this.featureQuotaService.recordTokenUsageAndDeduct(data.userId, data.taskType, data.usage);
    }

    /**
     * EventPattern version for fire-and-forget publishes from standalone workers
     * (e.g. agent-entry.ts which uses raw NATS publish without replyTo)
     */
    @EventPattern({ cmd: 'billing.quota.recordTokenUsage' })
    async recordTokenUsageEvent(@Payload() data: { userId: string, taskType: string, usage: any }) {
        this.logger.log(`[event] recordTokenUsage for user=${data.userId} taskType=${data.taskType}`);
        await this.featureQuotaService.recordTokenUsageAndDeduct(data.userId, data.taskType, data.usage);
    }
}
