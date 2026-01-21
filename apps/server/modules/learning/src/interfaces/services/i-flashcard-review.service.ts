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
    submitReview(userId: string, data: SubmitReviewDTO): Promise<FlashcardReviewResponseDTO>;
    getCardsDue(userId: string, query: GetCardsDueDTO): Promise<CardDueResponseDTO[]>;
    getUserProgress(userId: string, data: GetUserProgressDTO): Promise<UserProgressResponseDTO | null>;
}

export const FLASHCARD_REVIEW_SERVICE_TOKEN = Symbol('FLASHCARD_REVIEW_SERVICE_TOKEN');
