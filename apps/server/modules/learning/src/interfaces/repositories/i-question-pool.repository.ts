import type { QuestionPool, Prisma } from '@prisma/generated';

/**
 * Question Pool Repository Interface
 * Defines the contract for QuestionPool data access operations
 */
export interface IQuestionPoolRepository {
    /**
     * Find pool by ID
     */
    findById(poolId: string): Promise<QuestionPool | null>;

    /**
     * Find all pools with pagination and filtering
     */
    findMany(options: {
        skip: number;
        take: number;
        where?: Prisma.QuestionPoolWhereInput;
        orderBy?: Prisma.QuestionPoolOrderByWithRelationInput;
    }): Promise<QuestionPool[]>;

    /**
     * Count pools with optional filter
     */
    count(where?: Prisma.QuestionPoolWhereInput): Promise<number>;

    /**
     * Create new pool
     */
    create(data: Prisma.QuestionPoolCreateInput): Promise<QuestionPool>;

    /**
     * Update pool by ID
     */
    update(poolId: string, data: Prisma.QuestionPoolUpdateInput): Promise<QuestionPool>;

    /**
     * Delete pool (hard delete)
     */
    delete(poolId: string): Promise<void>;

    /**
     * Find pools by course
     */
    findByCourse(courseId: string): Promise<QuestionPool[]>;

    /**
     * Find pools by lesson
     */
    findByLesson(lessonId: string): Promise<QuestionPool[]>;

    /**
     * Find pools by JLPT level
     */
    findByJlptLevel(jlptLevel: string): Promise<QuestionPool[]>;
}

/**
 * Repository token for dependency injection
 */
export const QUESTION_POOL_REPOSITORY_TOKEN = Symbol('QUESTION_POOL_REPOSITORY_TOKEN');

