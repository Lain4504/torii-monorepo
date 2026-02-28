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
    createFlashcard(data: FlashcardCreateDTO & { userId: string }): Promise<FlashcardResponseDTO>;
    getFlashcards(params: FlashcardQueryDTO & { userId: string }): Promise<PaginatedResponseDTO<FlashcardResponseDTO>>;
    getFlashcardById(id: string): Promise<FlashcardResponseDTO>;
    updateFlashcard(data: FlashcardUpdateDTO & { userId: string }): Promise<FlashcardResponseDTO>;
    deleteFlashcard(id: string, userId: string): Promise<void>;
    bulkOperations(data: BulkFlashcardOperationsDTO & { userId: string }): Promise<BulkFlashcardOperationsResponseDTO>;
    generateFlashcardsFromAI(userId: string, deckId: string, topic: string, level: string): Promise<{ success: boolean; count: number }>;
}

export const FLASHCARD_SERVICE_TOKEN = Symbol('FLASHCARD_SERVICE_TOKEN');
