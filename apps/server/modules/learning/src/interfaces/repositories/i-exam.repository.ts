import type { Quiz, QuizAttempt, QuizAttemptDetail, Prisma } from '@prisma/generated';

/**
 * Exam Repository Interface
 * Defines the contract for Exam/Quiz data access operations
 */
export interface IExamRepository {
    /**
     * Find quiz by ID
     */
    findById(quizId: string, include?: Prisma.QuizInclude): Promise<Quiz | null>;

    /**
     * Find all quizzes with pagination and filtering
     */
    findMany(options: {
        skip: number;
        take: number;
        where?: Prisma.QuizWhereInput;
        orderBy?: Prisma.QuizOrderByWithRelationInput;
        include?: Prisma.QuizInclude;
    }): Promise<Quiz[]>;

    /**
     * Count quizzes with optional filter
     */
    count(where?: Prisma.QuizWhereInput): Promise<number>;

    /**
     * Create new quiz
     */
    create(data: Prisma.QuizCreateInput): Promise<Quiz>;

    /**
     * Update quiz by ID
     */
    update(quizId: string, data: Prisma.QuizUpdateInput): Promise<Quiz>;

    /**
     * Delete quiz (hard delete)
     */
    delete(quizId: string): Promise<void>;

    /**
     * Find quiz attempt by ID
     */
    findAttemptById(attemptId: string, include?: Prisma.QuizAttemptInclude): Promise<QuizAttempt | null>;

    /**
     * Find quiz attempts with pagination and filtering
     */
    findAttempts(options: {
        skip: number;
        take: number;
        where?: Prisma.QuizAttemptWhereInput;
        orderBy?: Prisma.QuizAttemptOrderByWithRelationInput;
        include?: Prisma.QuizAttemptInclude;
    }): Promise<QuizAttempt[]>;

    /**
     * Count quiz attempts with optional filter
     */
    countAttempts(where?: Prisma.QuizAttemptWhereInput): Promise<number>;

    /**
     * Create quiz attempt
     */
    createAttempt(data: Prisma.QuizAttemptCreateInput): Promise<QuizAttempt>;

    /**
     * Update quiz attempt by ID
     */
    updateAttempt(attemptId: string, data: Prisma.QuizAttemptUpdateInput): Promise<QuizAttempt>;

    /**
     * Create quiz attempt details in batch
     */
    createAttemptDetails(data: Prisma.QuizAttemptDetailCreateManyInput[]): Promise<{ count: number }>;

    /**
     * Find questions by IDs
     */
    findQuestionsByIds(questionIds: string[]): Promise<any[]>;

    /**
     * Find quiz questions by quiz ID
     */
    findQuizQuestions(quizId: string): Promise<any[]>;

    /**
     * Update question usage count
     */
    incrementQuestionUsageCount(questionId: string): Promise<void>;

    /**
     * Find questions by pool ID with usage count ordering
     */
    findQuestionsByPool(poolId: string, take: number): Promise<any[]>;

    /**
     * Find attempt details with questions by attempt ID
     */
    findAttemptDetails(attemptId: string): Promise<any[]>;
}

export const EXAM_REPOSITORY_TOKEN = Symbol('EXAM_REPOSITORY_TOKEN');

