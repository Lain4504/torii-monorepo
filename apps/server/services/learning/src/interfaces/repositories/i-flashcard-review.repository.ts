import type {
    FlashcardReview,
    FlashcardReviewSession,
    FlashcardUserProgress,
    Prisma
} from '@prisma/generated';

/**
 * Flashcard Review Repository Interface
 */
export interface IFlashcardReviewRepository {
    // Progress
    findProgress(userId: string, flashcardId: string): Promise<FlashcardUserProgress | null>;
    findManyProgress(where: Prisma.FlashcardUserProgressWhereInput, options?: { take?: number, skip?: number, include?: Prisma.FlashcardUserProgressInclude }): Promise<FlashcardUserProgress[]>;
    createProgress(data: Prisma.FlashcardUserProgressCreateInput): Promise<FlashcardUserProgress>;
    updateProgress(userId: string, flashcardId: string, data: Prisma.FlashcardUserProgressUpdateInput): Promise<FlashcardUserProgress>;

    // Reviews
    createReview(data: Prisma.FlashcardReviewCreateInput): Promise<FlashcardReview>;
    findReviews(where: Prisma.FlashcardReviewWhereInput): Promise<FlashcardReview[]>;

    // Sessions
    createSession(data: Prisma.FlashcardReviewSessionCreateInput): Promise<FlashcardReviewSession>;
    updateSession(id: string, data: Prisma.FlashcardReviewSessionUpdateInput): Promise<FlashcardReviewSession>;
    findSessionById(id: string): Promise<FlashcardReviewSession | null>;
    findManySessions(options: {
        skip: number;
        take: number;
        where?: Prisma.FlashcardReviewSessionWhereInput;
        orderBy?: Prisma.FlashcardReviewSessionOrderByWithRelationInput;
    }): Promise<FlashcardReviewSession[]>;
    countSessions(where?: Prisma.FlashcardReviewSessionWhereInput): Promise<number>;
}

export const FLASHCARD_REVIEW_REPOSITORY_TOKEN = Symbol('FLASHCARD_REVIEW_REPOSITORY_TOKEN');
