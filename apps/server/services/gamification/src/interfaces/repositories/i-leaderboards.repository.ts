export interface ILeaderboardsRepository {
    getTopByXp(limit: number): Promise<any[]>;
    getTopByWeeklyStreak(limit: number): Promise<any[]>;
    getUserXpRank(userId: string): Promise<number>;
    getUserWeeklyRank(userId: string): Promise<number>;
    countLearners(filter?: any): Promise<number>;
}

export const LEADERBOARDS_REPOSITORY_TOKEN = Symbol('LEADERBOARDS_REPOSITORY_TOKEN');
