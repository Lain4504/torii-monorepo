import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { CoinRepository } from './coin.repository';

@Injectable()
export class CoinService {
    private readonly logger = new Logger(CoinService.name);

    constructor(private readonly coinRepository: CoinRepository) { }

    async getBalance(userId: string) {
        let userCoin = await this.coinRepository.findByUserId(userId);

        if (!userCoin) {
            userCoin = await this.coinRepository.create(userId);
        }

        return userCoin.balance;
    }

    async addCoins(userId: string, amount: number, reason: string) {
        this.logger.log(`Adding ${amount} coins to user ${userId} for reason: ${reason}`);

        let userCoin = await this.coinRepository.findByUserId(userId);

        if (!userCoin) {
            await this.coinRepository.create(userId, amount);
        } else {
            await this.coinRepository.updateBalance(userId, amount);
        }

        return true;
    }

    async deductCoins(userId: string, amount: number, reason: string) {
        this.logger.log(`Deducting ${amount} coins from user ${userId} for reason: ${reason}`);

        const balance = await this.getBalance(userId);

        if (balance < amount) {
            throw new BadRequestException('Insufficient coin balance');
        }

        await this.coinRepository.updateBalance(userId, -amount);
        return true;
    }
}
