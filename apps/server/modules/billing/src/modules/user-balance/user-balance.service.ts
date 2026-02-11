import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { UserBalanceRepository } from './user-balance.repository';

@Injectable()
export class UserBalanceService {
    private readonly logger = new Logger(UserBalanceService.name);

    constructor(private readonly userBalanceRepository: UserBalanceRepository) { }

    async getBalance(userId: string) {
        let userBalance = await this.userBalanceRepository.findByUserId(userId);

        if (!userBalance) {
            userBalance = await this.userBalanceRepository.create(userId);
        }

        return userBalance.balance;
    }

    async addBalance(userId: string, amount: number, reason: string) {
        this.logger.log(`Adding ${amount} balance to user ${userId} for reason: ${reason}`);

        let userBalance = await this.userBalanceRepository.findByUserId(userId);

        if (!userBalance) {
            await this.userBalanceRepository.create(userId, amount);
        } else {
            await this.userBalanceRepository.updateBalance(userId, amount);
        }

        return true;
    }

    async deductBalance(userId: string, amount: number, reason: string) {
        this.logger.log(`Deducting ${amount} balance from user ${userId} for reason: ${reason}`);

        const balance = await this.getBalance(userId);

        if (balance < amount) {
            throw new BadRequestException('Insufficient balance');
        }

        await this.userBalanceRepository.updateBalance(userId, -amount);
        return true;
    }
}
