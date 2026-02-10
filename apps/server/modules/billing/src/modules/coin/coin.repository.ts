import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { UserCoin } from '@prisma/generated';
import { ICoinRepository } from '../../interfaces/repositories/i-coin.repository';

@Injectable()
export class CoinRepository implements ICoinRepository {
    private readonly logger = new Logger(CoinRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    async findByUserId(userId: string): Promise<UserCoin | null> {
        return this.prisma.userCoin.findUnique({
            where: { userId },
        });
    }

    async updateBalance(userId: string, amount: number): Promise<UserCoin> {
        return this.prisma.userCoin.update({
            where: { userId },
            data: {
                balance: {
                    increment: amount,
                },
            },
        });
    }

    async create(userId: string, initialBalance: number = 0): Promise<UserCoin> {
        return this.prisma.userCoin.create({
            data: {
                userId,
                balance: initialBalance,
            },
        });
    }
}
