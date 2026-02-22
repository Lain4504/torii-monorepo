import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserBalanceService } from '@server/billing/modules';

@Controller()
export class UserBalanceHandler {
    constructor(private readonly userBalanceService: UserBalanceService) { }

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
    async getHistory(@Payload() data: { userId: string, page: number, limit: number, type?: any }) {
        const { userId, ...query } = data;
        return this.userBalanceService.getHistory(userId, query);
    }
}
