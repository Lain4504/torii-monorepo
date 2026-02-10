import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserBalanceService } from '../../modules/user-balance/user-balance.service';

@Controller()
export class UserBalanceHandler {
    constructor(private readonly userBalanceService: UserBalanceService) { }

    @MessagePattern({ cmd: 'billing.user_balance.get' })
    async getBalance(@Payload() data: { userId: string }) {
        return this.userBalanceService.getBalance(data.userId);
    }

    @MessagePattern({ cmd: 'billing.user_balance.add' })
    async addBalance(@Payload() data: { userId: string, amount: number, reason: string }) {
        return this.userBalanceService.addBalance(data.userId, data.amount, data.reason);
    }

    @MessagePattern({ cmd: 'billing.user_balance.deduct' })
    async deductBalance(@Payload() data: { userId: string, amount: number, reason: string }) {
        return this.userBalanceService.deductBalance(data.userId, data.amount, data.reason);
    }
}
