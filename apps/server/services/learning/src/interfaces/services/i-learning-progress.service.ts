export const LEARNING_PROGRESS_SERVICE_TOKEN = Symbol(
  'LEARNING_PROGRESS_SERVICE_TOKEN',
);

export interface ILearningProgressService {
  /**
   * Get my courses.
   */
  getMyCourses(userId: string): Promise<any[]>;
  /**
   * Execute track lesson progress operation.
   */
  trackLessonProgress(
    userId: string,
    lessonId: string,
    seconds: number,
    totalSeconds: number,
  ): Promise<{ success: boolean }>;
  /**
   * Get user learning stats.
   */
  getUserLearningStats(userId: string): Promise<any>;
  /**
   * Get completed lessons.
   */
  getCompletedLessons(
    userId: string,
    courseMasterId: string,
  ): Promise<string[]>;
  /**
   * Get learning history.
   */
  getLearningHistory(userId: string): Promise<any[]>;
}
