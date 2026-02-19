import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { UserBalanceRepository } from './user-balance.repository';
import { PrismaService } from '@server/shared';
import { BalanceTransactionType } from '@prisma/generated';

@Injectable()
export class UserBalanceService {
    private readonly logger = new Logger(UserBalanceService.name);

    constructor(
        private readonly userBalanceRepository: UserBalanceRepository,
        private readonly prisma: PrismaService,
    ) { }

    async getBalance(userId: string) {
        let userBalance = await this.userBalanceRepository.findByUserId(userId);

        if (!userBalance) {
            userBalance = await this.userBalanceRepository.create(userId);
        }

        return userBalance.balance;
    }

    async addBalance(
        userId: string,
        amount: number,
        reason: string,
        type: BalanceTransactionType = BalanceTransactionType.OTHER,
        metadata: any = {}
    ) {
        this.logger.log(`Adding ${amount} balance to user ${userId} for reason: ${reason} (Type: ${type})`);

        let userBalance = await this.userBalanceRepository.findByUserId(userId);

        if (!userBalance) {
            await this.userBalanceRepository.create(userId, amount);
        } else {
            await this.userBalanceRepository.updateBalance(userId, amount);
        }

        // Log transaction history
        await this.prisma.balanceTransaction.create({
            data: {
                userId,
                amount,
                type,
                description: reason,
                metadata,
            }
        });

        return true;
    }

    async deductBalance(
        userId: string,
        amount: number,
        reason: string,
        type: BalanceTransactionType = BalanceTransactionType.PURCHASE,
        metadata: any = {}
    ) {
        this.logger.log(`Deducting ${amount} balance from user ${userId} for reason: ${reason} (Type: ${type})`);

        const balance = await this.getBalance(userId);

        if (balance < amount) {
            throw new BadRequestException('Insufficient balance');
        }

        await this.userBalanceRepository.updateBalance(userId, -amount);

        // Log transaction history
        await this.prisma.balanceTransaction.create({
            data: {
                userId,
                amount: -amount,
                type,
                description: reason,
                metadata,
            }
        });

        return true;
    }

    /**
     * Get balance transaction history with pagination
     */
    async getHistory(userId: string, query: { page?: any, limit?: any, type?: any }) {
        const page = parseInt(query.page as string || '1', 10) || 1;
        const limit = parseInt(query.limit as string || '10', 10) || 10;
        const { type } = query;
        const skip = (page - 1) * limit;

        const where: any = {
            userId,
        };

        if (type) {
            where.type = type;
        }

        const [data, total] = await Promise.all([
            this.prisma.balanceTransaction.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            this.prisma.balanceTransaction.count({ where }),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}
