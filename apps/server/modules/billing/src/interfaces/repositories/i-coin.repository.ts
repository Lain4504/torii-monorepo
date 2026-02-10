import { UserCoin } from '@prisma/generated';

export interface ICoinRepository {
    findByUserId(userId: string): Promise<UserCoin | null>;
    updateBalance(userId: string, amount: number): Promise<UserCoin>;
    create(userId: string, initialBalance?: number): Promise<UserCoin>;
}
