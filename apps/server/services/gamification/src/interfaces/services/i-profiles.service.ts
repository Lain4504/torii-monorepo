import type { UserGamificationDto, StreakStatusDto } from '@workspace/schemas';

export interface IProfilesService {
  /**
   * Get gamification profile.
   */
  getGamificationProfile(userId: string): Promise<UserGamificationDto>;
  /**
   * Get streak status.
   */
  getStreakStatus(userId: string): Promise<StreakStatusDto>;
  /**
   * Mark streak toast shown.
   */
  markStreakToastShown(userId: string): Promise<void>;
  /**
   * Record activity.
   */
  recordActivity(userId: string): Promise<{
    streakUpdated: boolean;
    oldStreak: number;
    newStreak: number;
    isMilestone: boolean;
  }>;
  /**
   * Execute grant freeze operation.
   */
  grantFreeze(userId: string, amount: number): Promise<void>;
  /**
   * Check streaks daily.
   */
  checkStreaksDaily(): Promise<void>;
  /**
   * Update xp.
   */
  updateXP(userId: string, xpGain: number, activityType?: string): Promise<any>;
}

export const PROFILES_SERVICE_TOKEN = Symbol('PROFILES_SERVICE_TOKEN');
