import type { Lesson, Prisma } from '@prisma/generated';

/**
 * Lesson Repository Interface
 * Defines the contract for Lesson data access operations
 */
export interface ILessonRepository {
    /**
     * Find lesson by ID
     */
    findById(lessonId: string): Promise<Lesson | null>;

    /**
     * Find all lessons for a module
     */
    findByModuleId(moduleId: string, includeDrafts?: boolean): Promise<Lesson[]>;

    /**
     * Find all lessons with pagination and filtering
     */
    findMany(options: {
        skip: number;
        take: number;
        where?: Prisma.LessonWhereInput;
        orderBy?: Prisma.LessonOrderByWithRelationInput;
        include?: Prisma.LessonInclude;
    }): Promise<Lesson[]>;

    /**
     * Count lessons with optional filter
     */
    count(where?: Prisma.LessonWhereInput): Promise<number>;

    /**
     * Create new lesson
     */
    create(data: Prisma.LessonCreateInput): Promise<Lesson>;

    /**
     * Update lesson by ID
     */
    update(lessonId: string, data: Prisma.LessonUpdateInput): Promise<Lesson>;

    /**
     * Delete lesson (hard delete)
     */
    delete(lessonId: string): Promise<void>;

    /**
     * Soft delete lesson
     */
    softDelete(lessonId: string): Promise<Lesson>;

    /**
     * Reorder lessons in a module
     */
    reorder(moduleId: string, lessonOrders: { id: string; orderIndex: number }[]): Promise<void>;

    /**
     * Get max order index for a module
     */
    getMaxOrderIndex(moduleId: string): Promise<number>;

    /**
     * Find preview lessons for a course (through modules)
     */
    findPreviewLessonsByCourseId(courseId: string): Promise<Lesson[]>;

    /**
     * Find top N lessons for a course (ordered by module and lesson index)
     */
    findTopLessonsByCourse(courseId: string, limit: number): Promise<Lesson[]>;
}
