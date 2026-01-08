import type { Question, Prisma } from '@prisma/generated';

/**
 * Question Repository Interface
 * Defines the contract for Question data access operations
 */
export interface IQuestionRepository {
    /**
     * Find question by ID
     */
    findById(questionId: string): Promise<Question | null>;

    /**
     * Find all questions with pagination and filtering
     */
    findMany(options: {
        skip: number;
        take: number;
        where?: Prisma.QuestionWhereInput;
        orderBy?: Prisma.QuestionOrderByWithRelationInput;
    }): Promise<Question[]>;

    /**
     * Count questions with optional filter
     */
    count(where?: Prisma.QuestionWhereInput): Promise<number>;

    /**
     * Create new question
     */
    create(data: Prisma.QuestionCreateInput): Promise<Question>;

    /**
     * Create multiple questions (bulk)
     */
    createMany(data: Prisma.QuestionCreateInput[]): Promise<{ count: number }>;

    /**
     * Update question by ID
     */
    update(questionId: string, data: Prisma.QuestionUpdateInput): Promise<Question>;

    /**
     * Update multiple questions (bulk)
     */
    updateMany(where: Prisma.QuestionWhereInput, data: Prisma.QuestionUpdateInput): Promise<{ count: number }>;

    /**
     * Delete question (hard delete)
     */
    delete(questionId: string): Promise<void>;

    /**
     * Delete multiple questions (bulk)
     */
    deleteMany(where: Prisma.QuestionWhereInput): Promise<{ count: number }>;

    /**
     * Find questions by category
     */
    findByCategory(category: string): Promise<Question[]>;

    /**
     * Find questions by JLPT level
     */
    findByJlptLevel(jlptLevel: string): Promise<Question[]>;

    /**
     * Find questions by status
     */
    findByStatus(status: string): Promise<Question[]>;

    /**
     * Find questions by pool
     */
    findByPool(poolId: string): Promise<Question[]>;

    /**
     * Update question usage count
     */
    incrementUsageCount(questionId: string): Promise<Question>;
}

/**
 * Repository token for dependency injection
 */
export const QUESTION_REPOSITORY_TOKEN = Symbol('QUESTION_REPOSITORY_TOKEN');

