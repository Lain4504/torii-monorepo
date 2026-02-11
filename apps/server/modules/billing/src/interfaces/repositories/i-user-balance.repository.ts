import { UserBalance } from '@prisma/generated';

export interface IUserBalanceRepository {
    findByUserId(userId: string): Promise<UserBalance | null>;
    updateBalance(userId: string, amount: number): Promise<UserBalance>;
    create(userId: string, initialBalance?: number): Promise<UserBalance>;
}
