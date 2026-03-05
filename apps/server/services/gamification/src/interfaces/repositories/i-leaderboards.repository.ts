export interface ILeaderboardsRepository {
  /**
   * Get top by xp.
   */
  getTopByXp(limit: number): Promise<any[]>;
  /**
   * Get top by weekly streak.
   */
  getTopByWeeklyStreak(limit: number): Promise<any[]>;
  /**
   * Get user xp rank.
   */
  getUserXpRank(userId: string): Promise<number>;
  /**
   * Get user weekly rank.
   */
  getUserWeeklyRank(userId: string): Promise<number>;
  /**
   * Count learners.
   */
  countLearners(filter?: any): Promise<number>;
}

export const LEADERBOARDS_REPOSITORY_TOKEN = Symbol(
  'LEADERBOARDS_REPOSITORY_TOKEN',
);
