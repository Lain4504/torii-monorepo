import type {
  FlashcardReview,
  FlashcardReviewSession,
  FlashcardUserProgress,
  Prisma,
} from '@prisma/generated';

/**
 * Flashcard Review Repository Interface
 */
export interface IFlashcardReviewRepository {
  // Progress
  /**
   * Find progress.
   */
  findProgress(
    userId: string,
    flashcardId: string,
  ): Promise<FlashcardUserProgress | null>;
  /**
   * Find many progress.
   */
  findManyProgress(
    where: Prisma.FlashcardUserProgressWhereInput,
    options?: {
      take?: number;
      skip?: number;
      include?: Prisma.FlashcardUserProgressInclude;
    },
  ): Promise<FlashcardUserProgress[]>;
  /**
   * Create progress.
   */
  createProgress(
    data: Prisma.FlashcardUserProgressCreateInput,
  ): Promise<FlashcardUserProgress>;
  /**
   * Update progress.
   */
  updateProgress(
    userId: string,
    flashcardId: string,
    data: Prisma.FlashcardUserProgressUpdateInput,
  ): Promise<FlashcardUserProgress>;

  // Reviews
  /**
   * Create review.
   */
  createReview(
    data: Prisma.FlashcardReviewCreateInput,
  ): Promise<FlashcardReview>;
  /**
   * Find reviews.
   */
  findReviews(
    where: Prisma.FlashcardReviewWhereInput,
  ): Promise<FlashcardReview[]>;

  // Sessions
  /**
   * Create session.
   */
  createSession(
    data: Prisma.FlashcardReviewSessionCreateInput,
  ): Promise<FlashcardReviewSession>;
  /**
   * Update session.
   */
  updateSession(
    id: string,
    data: Prisma.FlashcardReviewSessionUpdateInput,
  ): Promise<FlashcardReviewSession>;
  /**
   * Find session by id.
   */
  findSessionById(id: string): Promise<FlashcardReviewSession | null>;
  /**
   * Find many sessions.
   */
  findManySessions(options: {
    skip: number;
    take: number;
    where?: Prisma.FlashcardReviewSessionWhereInput;
    orderBy?: Prisma.FlashcardReviewSessionOrderByWithRelationInput;
  }): Promise<FlashcardReviewSession[]>;
  /**
   * Count sessions.
   */
  countSessions(
    where?: Prisma.FlashcardReviewSessionWhereInput,
  ): Promise<number>;
}

export const FLASHCARD_REVIEW_REPOSITORY_TOKEN = Symbol(
  'FLASHCARD_REVIEW_REPOSITORY_TOKEN',
);
