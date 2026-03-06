import { UserBalance } from '@prisma/generated';

export interface IUserBalanceRepository {
  /**
   * Find by user id.
   */
  findByUserId(userId: string): Promise<UserBalance | null>;
  /**
   * Update balance.
   */
  updateBalance(userId: string, amount: number): Promise<UserBalance>;
  /**
   * Create data.
   */
  create(userId: string, initialBalance?: number): Promise<UserBalance>;
}
