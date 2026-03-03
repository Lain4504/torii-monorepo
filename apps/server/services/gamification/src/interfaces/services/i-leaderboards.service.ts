import { LeaderboardDto } from '@workspace/schemas';

export interface ILeaderboardsService {
    getGlobalLeaderboard(userId?: string): Promise<LeaderboardDto>;
    getWeeklyLeaderboard(userId?: string): Promise<LeaderboardDto>;
}

export const LEADERBOARDS_SERVICE_TOKEN = Symbol('LEADERBOARDS_SERVICE_TOKEN');
