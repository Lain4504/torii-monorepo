export interface IRedemptionsService {
    getAvailableRewards(): Promise<any[]>;
    getUserRedemptionHistory(userId: string): Promise<any[]>;
    redeemReward(userId: string, rewardId: string): Promise<any>;
}

export const REDEMPTIONS_SERVICE_TOKEN = Symbol('REDEMPTIONS_SERVICE_TOKEN');
