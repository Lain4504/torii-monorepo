import type { UserGamificationDto, StreakStatusDto } from '@workspace/schemas';

export interface IProfilesService {
    getGamificationProfile(userId: string): Promise<UserGamificationDto>;
    getStreakStatus(userId: string): Promise<StreakStatusDto>;
    markStreakToastShown(userId: string): Promise<void>;
    recordActivity(userId: string): Promise<{
        streakUpdated: boolean;
        oldStreak: number;
        newStreak: number;
        isMilestone: boolean;
    }>;
    grantFreeze(userId: string, amount: number): Promise<void>;
    checkStreaksDaily(): Promise<void>;
    updateXP(userId: string, xpGain: number, activityType?: string): Promise<any>;
}

export const PROFILES_SERVICE_TOKEN = Symbol('PROFILES_SERVICE_TOKEN');
