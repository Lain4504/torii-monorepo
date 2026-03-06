import { LeaderboardDto } from '@workspace/schemas';

export interface ILeaderboardsService {
  /**
   * Get global leaderboard.
   */
  getGlobalLeaderboard(userId?: string): Promise<LeaderboardDto>;
  /**
   * Get weekly leaderboard.
   */
  getWeeklyLeaderboard(userId?: string): Promise<LeaderboardDto>;
}

export const LEADERBOARDS_SERVICE_TOKEN = Symbol('LEADERBOARDS_SERVICE_TOKEN');
