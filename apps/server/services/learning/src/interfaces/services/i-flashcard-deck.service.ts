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
    createDeck(data: FlashcardDeckCreateDTO & { userId: string }): Promise<FlashcardDeckResponseDTO>;
    findAllDecks(query: FlashcardDeckQueryDTO & { userId: string }): Promise<PaginatedResponseDTO<FlashcardDeckResponseDTO>>;
    findOneDeck(id: string, userId: string): Promise<FlashcardDeckResponseDTO>;
    updateDeck(id: string, data: FlashcardDeckUpdateDTO, userId: string): Promise<FlashcardDeckResponseDTO>;
    deleteDeck(id: string, userId: string): Promise<void>;
}

export const FLASHCARD_DECK_SERVICE_TOKEN = Symbol('FLASHCARD_DECK_SERVICE_TOKEN');
