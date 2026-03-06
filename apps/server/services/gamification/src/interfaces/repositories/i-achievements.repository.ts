export interface IAchievementsRepository {
  /**
   * Find all active.
   */
  findAllActive(): Promise<any[]>;
  /**
   * Find by user id.
   */
  findByUserId(userId: string): Promise<any[]>;
  /**
   * Find by code.
   */
  findByCode(code: string): Promise<any | null>;
  /**
   * Find user achievement.
   */
  findUserAchievement(
    userId: string,
    achievementId: string,
  ): Promise<any | null>;
  /**
   * Upsert achievement.
   */
  upsertAchievement(code: string, data: any): Promise<any>;
  /**
   * Upsert user achievement.
   */
  upsertUserAchievement(
    userId: string,
    achievementId: string,
    data: any,
  ): Promise<any>;
}

export const ACHIEVEMENTS_REPOSITORY_TOKEN = Symbol(
  'ACHIEVEMENTS_REPOSITORY_TOKEN',
);
