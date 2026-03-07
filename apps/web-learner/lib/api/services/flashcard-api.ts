import { apiClient } from '../api-client';
import type { StandardApiResponse } from '@workspace/schemas';

// ============================================================================
// NEW FLASHCARD SYSTEM - Matches FLASHCARD_SPEC.md
// ============================================================================

export type SrsState = 'NEW' | 'LEARNING' | 'REVIEW' | 'MASTERED';

export interface FlashcardDeck {
    id: string;
    userId: string;
    name: string;
    description?: string;
    isPublic: boolean;
    stats?: {
        cardCount?: number;
        newCount?: number;
        learningCount?: number;
        reviewCount?: number;
        masteredCount?: number;
    };
    createdAt: string;
    updatedAt: string;
}

export interface Flashcard {
    id: string;
    deckId: string;
    noteId?: string;
    term: string;
    definition: string;
    hint?: string;
    mediaUrl?: string;
    languageDetails?: Record<string, any>;
    tags?: string[];
    srsState: SrsState;
    nextReviewAt?: string;
    interval: number;
    easeFactor: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateDeckDTO {
    name: string;
    description?: string;
    isPublic?: boolean;
}

export interface UpdateDeckDTO {
    name?: string;
    description?: string;
    isPublic?: boolean;
}

export interface CreateCardDTO {
    deckId: string;
    term: string;
    definition: string;
    hint?: string;
    mediaUrl?: string;
    languageDetails?: Record<string, any>;
    tags?: string[];
    noteId?: string;
}

export interface UpdateCardDTO {
    id: string;
    term?: string;
    definition?: string;
    hint?: string;
    mediaUrl?: string;
    languageDetails?: Record<string, any>;
    tags?: string[];
}

export interface ReviewCardDTO {
    quality: 0 | 1; // 0: Forgot, 1: Remember
}

export interface StudyCard {
    id: string;
    term: string;
    definition: string;
    hint?: string;
    mediaUrl?: string;
    languageDetails?: Record<string, any>;
    srsState: SrsState;
}

export const flashcardApi = {
    // ========================================================================
    // DECKS
    // ========================================================================

    /**
     * Get all decks for current user
     */
    getMyDecks: async (): Promise<FlashcardDeck[]> => {
        const response = await apiClient.get<StandardApiResponse<FlashcardDeck[]>>('/api/flashcards/decks');
        if (!response.data.success) throw new Error(response.data.message || 'Failed to fetch decks');
        return response.data.data!;
    },

    /**
     * Get deck by ID
     */
    getDeckById: async (id: string): Promise<FlashcardDeck> => {
        const response = await apiClient.get<StandardApiResponse<FlashcardDeck>>(`/api/flashcards/decks/${id}`);
        if (!response.data.success) throw new Error(response.data.message || 'Failed to fetch deck');
        return response.data.data!;
    },

    /**
     * Create a new deck
     */
    createDeck: async (data: CreateDeckDTO): Promise<FlashcardDeck> => {
        const response = await apiClient.post<StandardApiResponse<FlashcardDeck>>('/api/flashcards/decks', data);
        if (!response.data.success) throw new Error(response.data.message || 'Failed to create deck');
        return response.data.data!;
    },

    /**
     * Update a deck
     */
    updateDeck: async (id: string, data: UpdateDeckDTO): Promise<FlashcardDeck> => {
        const response = await apiClient.patch<StandardApiResponse<FlashcardDeck>>(`/api/flashcards/decks/${id}`, data);
        if (!response.data.success) throw new Error(response.data.message || 'Failed to update deck');
        return response.data.data!;
    },

    /**
     * Delete a deck
     */
    deleteDeck: async (id: string): Promise<void> => {
        const response = await apiClient.delete<StandardApiResponse<void>>(`/api/flashcards/decks/${id}`);
        if (!response.data.success) throw new Error(response.data.message || 'Failed to delete deck');
    },

    // ========================================================================
    // CARDS
    // ========================================================================

    /**
     * Add a card to a deck
     */
    addCard: async (deckId: string, data: Omit<CreateCardDTO, 'deckId'>): Promise<Flashcard> => {
        const response = await apiClient.post<StandardApiResponse<Flashcard>>(`/api/flashcards/decks/${deckId}/cards`, data);
        if (!response.data.success) throw new Error(response.data.message || 'Failed to add card');
        return {
            ...response.data.data!,
            mediaUrl: (response.data.data as any)?.imageUrl ?? response.data.data?.mediaUrl,
        };
    },

    /**
     * Update a card
     */
    updateCard: async (cardId: string, data: Omit<UpdateCardDTO, 'id'>): Promise<Flashcard> => {
        const response = await apiClient.patch<StandardApiResponse<Flashcard>>(`/api/flashcards/cards/${cardId}`, data);
        if (!response.data.success) throw new Error(response.data.message || 'Failed to update card');
        return {
            ...response.data.data!,
            mediaUrl: (response.data.data as any)?.imageUrl ?? response.data.data?.mediaUrl,
        };
    },

    /**
     * Delete a card
     */
    deleteCard: async (cardId: string): Promise<void> => {
        const response = await apiClient.delete<StandardApiResponse<void>>(`/api/flashcards/cards/${cardId}`);
        if (!response.data.success) throw new Error(response.data.message || 'Failed to delete card');
    },

    /**
     * Get all cards in a deck
     */
    getDeckCards: async (deckId: string): Promise<Flashcard[]> => {
        const response = await apiClient.get<StandardApiResponse<Flashcard[]>>(`/api/flashcards/decks/${deckId}/cards`);
        if (!response.data.success) throw new Error(response.data.message || 'Failed to fetch cards');
        return (response.data.data || []).map((card: any) => ({
            ...card,
            mediaUrl: card?.imageUrl ?? card?.mediaUrl,
        }));
    },

    // ========================================================================
    // STUDY / SRS
    // ========================================================================

    /**
     * Get today's study cards (NEW or due for review)
     */
    getStudyCards: async (deckId: string): Promise<StudyCard[]> => {
        const response = await apiClient.get<StandardApiResponse<StudyCard[]>>(`/api/flashcards/decks/${deckId}/study`);
        if (!response.data.success) throw new Error(response.data.message || 'Failed to fetch study cards');
        return response.data.data!;
    },

    /**
     * Submit review for a card
     * @param cardId - Card ID
     * @param quality - 0 = Forgot, 1 = Remember
     */
    reviewCard: async (cardId: string, quality: 0 | 1): Promise<Flashcard> => {
        const response = await apiClient.post<StandardApiResponse<Flashcard>>(`/api/flashcards/cards/${cardId}/review`, { quality });
        if (!response.data.success) throw new Error(response.data.message || 'Failed to review card');
        return {
            ...response.data.data!,
            mediaUrl: (response.data.data as any)?.imageUrl ?? response.data.data?.mediaUrl,
        };
    },
};
