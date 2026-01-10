import { apiClient } from '../api-client';
import type {
    FlashcardDeckResponseDTO,
    PaginatedResponseDTO,
    FlashcardDeckCreateDTO,
    FlashcardDeckUpdateDTO,
    FlashcardDeckQueryDTO,
    FlashcardResponseDTO,
    FlashcardCreateDTO,
    FlashcardUpdateDTO,
    FlashcardQueryDTO,
} from '@workspace/schemas';

export const flashcardApi = {
    // --- DECKS ---

    getDecks: async (params: FlashcardDeckQueryDTO = {}): Promise<PaginatedResponseDTO<FlashcardDeckResponseDTO>> => {
        const response = await apiClient.get<PaginatedResponseDTO<FlashcardDeckResponseDTO>>('/api/flashcard-decks', {
            params,
        });
        return response.data;
    },

    createDeck: async (data: FlashcardDeckCreateDTO): Promise<FlashcardDeckResponseDTO> => {
        const response = await apiClient.post<FlashcardDeckResponseDTO>('/api/flashcard-decks', data);
        return response.data;
    },

    updateDeck: async (id: string, data: FlashcardDeckUpdateDTO): Promise<FlashcardDeckResponseDTO> => {
        const response = await apiClient.patch<FlashcardDeckResponseDTO>(`/api/flashcard-decks/${id}`, data);
        return response.data;
    },

    deleteDeck: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/flashcard-decks/${id}`);
    },

    // --- FLASHCARDS ---

    getFlashcards: async (params: FlashcardQueryDTO = {}): Promise<PaginatedResponseDTO<FlashcardResponseDTO>> => {
        const response = await apiClient.get<PaginatedResponseDTO<FlashcardResponseDTO>>('/api/flashcards', {
            params,
        });
        return response.data;
    },

    getFlashcardById: async (id: string): Promise<FlashcardResponseDTO> => {
        const response = await apiClient.get<FlashcardResponseDTO>(`/api/flashcards/${id}`);
        return response.data;
    },

    createFlashcard: async (data: FlashcardCreateDTO): Promise<FlashcardResponseDTO> => {
        const response = await apiClient.post<FlashcardResponseDTO>('/api/flashcards', data);
        return response.data;
    },

    updateFlashcard: async (data: FlashcardUpdateDTO): Promise<FlashcardResponseDTO> => {
        const response = await apiClient.patch<FlashcardResponseDTO>('/api/flashcards', data);
        return response.data;
    },

    deleteFlashcard: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/flashcards/${id}`);
    },

    // --- REVIEWS ---

    getCardsDue: async (params: { deckId?: string; limit?: number }): Promise<any[]> => {
        const response = await apiClient.get<any[]>('/api/flashcards/reviews/due', { params });
        return response.data;
    },

    submitReview: async (data: { flashcardId: string; deckId: string; quality: number; timeSpent: number; sessionId?: string }): Promise<any> => {
        const response = await apiClient.post<any>('/api/flashcards/reviews/submit', data);
        return response.data;
    },

    startSession: async (data: { deckId: string; studyMode?: string }): Promise<any> => {
        const response = await apiClient.post<any>('/api/flashcards/reviews/sessions', data);
        return response.data;
    },

    completeSession: async (sessionId: string, data: { durationSeconds?: number } = {}): Promise<any> => {
        const response = await apiClient.patch<any>(`/api/flashcards/reviews/sessions/${sessionId}/complete`, data);
        return response.data;
    }
};
