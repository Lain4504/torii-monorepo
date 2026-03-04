import type {
    FlashcardCreateDTO,
    FlashcardUpdateDTO,
    FlashcardQueryDTO,
    FlashcardResponseDTO,
    PaginatedResponseDTO,
    BulkFlashcardOperationsDTO,
    BulkFlashcardOperationsResponseDTO,
} from '@workspace/schemas';

/**
 * Flashcard Service Interface
 */
export interface IFlashcardService {
    /**
     * Create flashcard.
     */
    createFlashcard(data: FlashcardCreateDTO & { userId: string }): Promise<FlashcardResponseDTO>;
    /**
     * Get flashcards.
     */
    getFlashcards(params: FlashcardQueryDTO & { userId: string }): Promise<PaginatedResponseDTO<FlashcardResponseDTO>>;
    /**
     * Get flashcard by id.
     */
    getFlashcardById(id: string): Promise<FlashcardResponseDTO>;
    /**
     * Update flashcard.
     */
    updateFlashcard(data: FlashcardUpdateDTO & { userId: string }): Promise<FlashcardResponseDTO>;
    /**
     * Delete flashcard.
     */
    deleteFlashcard(id: string, userId: string): Promise<void>;
    /**
     * Execute bulk operations operation.
     */
    bulkOperations(data: BulkFlashcardOperationsDTO & { userId: string }): Promise<BulkFlashcardOperationsResponseDTO>;
    /**
     * Generate flashcards from ai.
     */
    generateFlashcardsFromAI(userId: string, deckId: string, topic: string, level: string): Promise<{ success: boolean; count: number }>;
}

export const FLASHCARD_SERVICE_TOKEN = Symbol('FLASHCARD_SERVICE_TOKEN');
