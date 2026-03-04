export interface IRedemptionsService {
    /**
     * Get available rewards.
     */
    getAvailableRewards(): Promise<any[]>;
    /**
     * Get user redemption history.
     */
    getUserRedemptionHistory(userId: string): Promise<any[]>;
    /**
     * Redeem reward.
     */
    redeemReward(userId: string, rewardId: string): Promise<any>;
}

export const REDEMPTIONS_SERVICE_TOKEN = Symbol('REDEMPTIONS_SERVICE_TOKEN');
