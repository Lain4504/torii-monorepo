export interface IRedemptionsRepository {
  /**
   * Find all rewards.
   */
  findAllRewards(): Promise<any[]>;
  /**
   * Find reward by id.
   */
  findRewardById(id: string): Promise<any | null>;
  /**
   * Find user history.
   */
  findUserHistory(userId: string): Promise<any[]>;
}

export const REDEMPTIONS_REPOSITORY_TOKEN = Symbol(
  'REDEMPTIONS_REPOSITORY_TOKEN',
);
