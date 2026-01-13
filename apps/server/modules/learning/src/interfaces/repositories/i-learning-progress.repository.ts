import { LessonProgress, Prisma } from '@prisma/generated';

export const LEARNING_PROGRESS_REPOSITORY_TOKEN = Symbol('LEARNING_PROGRESS_REPOSITORY_TOKEN');

export interface ILearningProgressRepository {
    findByEnrollmentAndLesson(enrollmentId: string, lessonId: string): Promise<LessonProgress | null>;

    upsert(
        enrollmentId: string,
        lessonId: string,
        createData: Prisma.LessonProgressCreateInput,
        updateData: Prisma.LessonProgressUpdateInput
    ): Promise<LessonProgress>;

    countCompletedLessons(enrollmentId: string): Promise<number>;

    /**
     * Get total learning seconds for a list of enrollments
     */
    getTotalLearningSeconds(enrollmentIds: string[]): Promise<number>;
}
