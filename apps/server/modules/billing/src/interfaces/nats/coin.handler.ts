import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CoinService } from '../../modules/coin/coin.service';

@Controller()
export class CoinHandler {
    constructor(private readonly coinService: CoinService) { }

    @MessagePattern({ cmd: 'billing.coin.get_balance' })
    async getBalance(@Payload() data: { userId: string }) {
        return this.coinService.getBalance(data.userId);
    }

    @MessagePattern({ cmd: 'billing.coin.add' })
    async addCoins(@Payload() data: { userId: string, amount: number, reason: string }) {
        return this.coinService.addCoins(data.userId, data.amount, data.reason);
    }

    @MessagePattern({ cmd: 'billing.coin.deduct' })
    async deductCoins(@Payload() data: { userId: string, amount: number, reason: string }) {
        return this.coinService.deductCoins(data.userId, data.amount, data.reason);
    }
}
