import { UserAchievementDto } from '@workspace/schemas';

export interface IAchievementsService {
    getUserAchievements(userId: string): Promise<UserAchievementDto[]>;
    checkStreakAchievements(userId: string, currentStreak: number): Promise<void>;
    checkLessonAchievements(userId: string): Promise<void>;
    checkCourseAchievements(userId: string): Promise<void>;
    checkQuizAchievements(userId: string, score: number, jlptLevel: string): Promise<void>;
    checkFlashcardAchievements(userId: string): Promise<void>;
    unlockAchievement(userId: string, achievementCode: string): Promise<void>;
}

export const ACHIEVEMENTS_SERVICE_TOKEN = Symbol('ACHIEVEMENTS_SERVICE_TOKEN');
