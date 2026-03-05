import { LessonProgress, Prisma } from '@prisma/generated';

export const LEARNING_PROGRESS_REPOSITORY_TOKEN = Symbol(
  'LEARNING_PROGRESS_REPOSITORY_TOKEN',
);

export interface ILearningProgressRepository {
  /**
   * Find by enrollment and lesson.
   */
  findByEnrollmentAndLesson(
    enrollmentId: string,
    lessonId: string,
  ): Promise<LessonProgress | null>;

  /**
   * Upsert data.
   */
  upsert(
    enrollmentId: string,
    lessonId: string,
    createData: Prisma.LessonProgressCreateInput,
    updateData: Prisma.LessonProgressUpdateInput,
  ): Promise<LessonProgress>;

  /**
   * Count completed lessons.
   */
  countCompletedLessons(enrollmentId: string): Promise<number>;

  /**
   * Get total learning seconds for a list of enrollments
   */
  getTotalLearningSeconds(enrollmentIds: string[]): Promise<number>;

  /**
   * Get all completed lesson IDs for an enrollment
   */
  getCompletedLessonIds(enrollmentId: string): Promise<string[]>;

  /**
   * Find recent progress.
   */
  findRecentProgress(userId: string, limit: number): Promise<any[]>;
}
