import type {
    ReviewSessionResponseDTO,
    StartReviewSessionDTO,
} from '@workspace/schemas';

/**
 * Flashcard Review Session Service Interface
 */
export interface IFlashcardReviewSessionService {
    /**
     * Start session.
     */
    startSession(userId: string, data: StartReviewSessionDTO): Promise<ReviewSessionResponseDTO>;
    /**
     * Complete session.
     */
    completeSession(sessionId: string, userId: string, data: { durationSeconds?: number }): Promise<ReviewSessionResponseDTO>;
    /**
     * Get session by id.
     */
    getSessionById(sessionId: string, userId: string): Promise<ReviewSessionResponseDTO>;
    /**
     * Get recent sessions.
     */
    getRecentSessions(userId: string, deckId?: string, limit?: number): Promise<ReviewSessionResponseDTO[]>;
}

export const FLASHCARD_REVIEW_SESSION_SERVICE_TOKEN = Symbol('FLASHCARD_REVIEW_SESSION_SERVICE_TOKEN');
