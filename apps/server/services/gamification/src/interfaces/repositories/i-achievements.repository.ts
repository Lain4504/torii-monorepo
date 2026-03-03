export interface IAchievementsRepository {
    findAllActive(): Promise<any[]>;
    findByUserId(userId: string): Promise<any[]>;
    findByCode(code: string): Promise<any | null>;
    findUserAchievement(userId: string, achievementId: string): Promise<any | null>;
    upsertAchievement(code: string, data: any): Promise<any>;
    upsertUserAchievement(userId: string, achievementId: string, data: any): Promise<any>;
}

export const ACHIEVEMENTS_REPOSITORY_TOKEN = Symbol('ACHIEVEMENTS_REPOSITORY_TOKEN');
