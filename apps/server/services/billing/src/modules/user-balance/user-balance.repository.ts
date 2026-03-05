import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { UserBalance } from '@prisma/generated';
import { IUserBalanceRepository } from '@server/billing/interfaces/repositories/i-user-balance.repository';

@Injectable()
export class UserBalanceRepository implements IUserBalanceRepository {
  private readonly logger = new Logger(UserBalanceRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<UserBalance | null> {
    return this.prisma.userBalance.findUnique({
      where: { userId },
    });
  }

  async updateBalance(userId: string, amount: number): Promise<UserBalance> {
    return this.prisma.userBalance.update({
      where: { userId },
      data: {
        balance: {
          increment: amount,
        },
      },
    });
  }

  async create(
    userId: string,
    initialBalance: number = 0,
  ): Promise<UserBalance> {
    return this.prisma.userBalance.create({
      data: {
        userId,
        balance: initialBalance,
      },
    });
  }
}
