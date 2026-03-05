import type {
  SubmitReviewDTO,
  FlashcardReviewResponseDTO,
  GetCardsDueDTO,
  CardDueResponseDTO,
  GetUserProgressDTO,
  UserProgressResponseDTO,
} from '@workspace/schemas';

/**
 * Flashcard Review Service Interface
 */
export interface IFlashcardReviewService {
  /**
   * Submit review.
   */
  submitReview(
    userId: string,
    data: SubmitReviewDTO,
  ): Promise<FlashcardReviewResponseDTO>;
  /**
   * Get cards due.
   */
  getCardsDue(
    userId: string,
    query: GetCardsDueDTO,
  ): Promise<CardDueResponseDTO[]>;
  /**
   * Get user progress.
   */
  getUserProgress(
    userId: string,
    data: GetUserProgressDTO,
  ): Promise<UserProgressResponseDTO | null>;
}

export const FLASHCARD_REVIEW_SERVICE_TOKEN = Symbol(
  'FLASHCARD_REVIEW_SERVICE_TOKEN',
);
