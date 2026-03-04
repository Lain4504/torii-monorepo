import type {
    FlashcardDeckCreateDTO,
    FlashcardDeckUpdateDTO,
    FlashcardDeckQueryDTO,
    FlashcardDeckResponseDTO,
    PaginatedResponseDTO,
} from '@workspace/schemas';

/**
 * Flashcard Deck Service Interface
 */
export interface IFlashcardDeckService {
    /**
     * Create deck.
     */
    createDeck(data: FlashcardDeckCreateDTO & { userId: string }): Promise<FlashcardDeckResponseDTO>;
    /**
     * Find all decks.
     */
    findAllDecks(query: FlashcardDeckQueryDTO & { userId: string }): Promise<PaginatedResponseDTO<FlashcardDeckResponseDTO>>;
    /**
     * Find one deck.
     */
    findOneDeck(id: string, userId: string): Promise<FlashcardDeckResponseDTO>;
    /**
     * Update deck.
     */
    updateDeck(id: string, data: FlashcardDeckUpdateDTO, userId: string): Promise<FlashcardDeckResponseDTO>;
    /**
     * Delete deck.
     */
    deleteDeck(id: string, userId: string): Promise<void>;
}

export const FLASHCARD_DECK_SERVICE_TOKEN = Symbol('FLASHCARD_DECK_SERVICE_TOKEN');
