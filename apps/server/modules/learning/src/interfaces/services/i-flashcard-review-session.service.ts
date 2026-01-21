import type {
    ReviewSessionResponseDTO,
    StartReviewSessionDTO,
    PaginatedResponseDTO,
} from '@workspace/schemas';

/**
 * Flashcard Review Session Service Interface
 */
export interface IFlashcardReviewSessionService {
    startSession(userId: string, data: StartReviewSessionDTO): Promise<ReviewSessionResponseDTO>;
    completeSession(sessionId: string, userId: string, data: { durationSeconds?: number }): Promise<ReviewSessionResponseDTO>;
    getSessionById(sessionId: string, userId: string): Promise<ReviewSessionResponseDTO>;
    getRecentSessions(userId: string, deckId?: string, limit?: number): Promise<ReviewSessionResponseDTO[]>;
}

export const FLASHCARD_REVIEW_SESSION_SERVICE_TOKEN = Symbol('FLASHCARD_REVIEW_SESSION_SERVICE_TOKEN');
