import { UserAchievementDto } from '@workspace/schemas';

export interface IAchievementsService {
  /**
   * Get user achievements.
   */
  getUserAchievements(userId: string): Promise<UserAchievementDto[]>;
  /**
   * Check streak achievements.
   */
  checkStreakAchievements(userId: string, currentStreak: number): Promise<void>;
  /**
   * Check lesson achievements.
   */
  checkLessonAchievements(userId: string): Promise<void>;
  /**
   * Check course achievements.
   */
  checkCourseAchievements(userId: string): Promise<void>;
  /**
   * Check quiz achievements.
   */
  checkQuizAchievements(
    userId: string,
    score: number,
    jlptLevel: string,
  ): Promise<void>;
  /**
   * Check flashcard achievements.
   */
  checkFlashcardAchievements(userId: string): Promise<void>;
  /**
   * Execute unlock achievement operation.
   */
  unlockAchievement(userId: string, achievementCode: string): Promise<void>;
}

export const ACHIEVEMENTS_SERVICE_TOKEN = Symbol('ACHIEVEMENTS_SERVICE_TOKEN');
