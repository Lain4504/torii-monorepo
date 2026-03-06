export interface IRedemptionsService {
  /** Get all available active rewards (public). */
  getAvailableRewards(): Promise<any[]>;

  /** Get a user's redemption history. */
  getUserRedemptionHistory(userId: string): Promise<any[]>;

  /** Redeem a reward using user points. */
  redeemReward(userId: string, rewardId: string): Promise<any>;

  /** [Admin] Create a new point reward. */
  createReward(data: any): Promise<any>;

  /** [Admin] Update an existing point reward. */
  updateReward(id: string, data: any): Promise<any>;

  /** [Admin] Delete a point reward. */
  deleteReward(id: string): Promise<any>;
}

export const REDEMPTIONS_SERVICE_TOKEN = Symbol('REDEMPTIONS_SERVICE_TOKEN');
