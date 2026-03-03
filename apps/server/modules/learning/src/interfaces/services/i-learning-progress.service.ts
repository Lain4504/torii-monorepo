
export const LEARNING_PROGRESS_SERVICE_TOKEN = Symbol('LEARNING_PROGRESS_SERVICE_TOKEN');

export interface ILearningProgressService {
    getMyCourses(userId: string): Promise<any[]>;
    trackLessonProgress(userId: string, lessonId: string, seconds: number, totalSeconds: number): Promise<{ success: boolean }>;
    getUserLearningStats(userId: string): Promise<any>;
    getCompletedLessons(userId: string, courseMasterId: string): Promise<string[]>;
    getLearningHistory(userId: string): Promise<any[]>;
}
