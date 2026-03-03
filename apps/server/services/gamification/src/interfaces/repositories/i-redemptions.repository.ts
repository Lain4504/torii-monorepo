export interface IRedemptionsRepository {
    findAllRewards(): Promise<any[]>;
    findRewardById(id: string): Promise<any | null>;
    findUserHistory(userId: string): Promise<any[]>;
}

export const REDEMPTIONS_REPOSITORY_TOKEN = Symbol('REDEMPTIONS_REPOSITORY_TOKEN');
