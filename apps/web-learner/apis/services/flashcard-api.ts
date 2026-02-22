import { apiClient } from '../api-client';
import type {
    FlashcardDeckResponseDTO,
    FlashcardDeckCreateDTO,
    FlashcardDeckUpdateDTO,
    FlashcardDeckQueryDTO,
    FlashcardResponseDTO,
    FlashcardCreateDTO,
    FlashcardUpdateDTO,
    FlashcardQueryDTO,
    StandardApiResponse,
    PaginatedApiResponse,
    BulkFlashcardOperationsDTO,
    BulkFlashcardOperationsResponseDTO,
} from '@workspace/schemas';

export const flashcardApi = {
    // --- DECKS ---

    getDecks: async (params: Partial<FlashcardDeckQueryDTO> = {}): Promise<PaginatedApiResponse<FlashcardDeckResponseDTO>> => {
        const query: FlashcardDeckQueryDTO = {
            page: params.page ?? 1,
            limit: params.limit ?? 10,
            search: params.search,
            jlptLevel: params.jlptLevel,
        };

        const response = await apiClient.get<PaginatedApiResponse<FlashcardDeckResponseDTO>>('/api/flashcard-decks', { params: query });
        return response.data;
    },

    createDeck: async (data: FlashcardDeckCreateDTO): Promise<FlashcardDeckResponseDTO> => {
        const response = await apiClient.post<StandardApiResponse<{ deck: FlashcardDeckResponseDTO }>>('/api/flashcard-decks', data);
        return response.data.data!.deck;
    },

    updateDeck: async (id: string, data: FlashcardDeckUpdateDTO): Promise<FlashcardDeckResponseDTO> => {
        const response = await apiClient.patch<StandardApiResponse<{ deck: FlashcardDeckResponseDTO }>>(`/api/flashcard-decks/${id}`, data);
        return response.data.data!.deck;
    },

    deleteDeck: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/flashcard-decks/${id}`);
    },

    // --- FLASHCARDS ---

    getFlashcards: async (params: Partial<FlashcardQueryDTO> = {}): Promise<PaginatedApiResponse<FlashcardResponseDTO>> => {
        const query: FlashcardQueryDTO = {
            page: params.page ?? 1,
            limit: params.limit ?? 10,
            deckId: params.deckId,
            search: params.search,
            difficulty: params.difficulty,
            tags: params.tags,
            jlptLevel: params.jlptLevel,
            dueForReview: params.dueForReview,
            userId: params.userId,
            isArchived: params.isArchived,
        };

        const response = await apiClient.get<PaginatedApiResponse<FlashcardResponseDTO>>('/api/flashcards', { params: query });
        return response.data;
    },

    getFlashcardById: async (id: string): Promise<FlashcardResponseDTO> => {
        const response = await apiClient.get<StandardApiResponse<{ flashcard: FlashcardResponseDTO }>>(`/api/flashcards/${id}`);
        return response.data.data!.flashcard;
    },

    createFlashcard: async (data: FlashcardCreateDTO): Promise<FlashcardResponseDTO> => {
        const response = await apiClient.post<StandardApiResponse<{ flashcard: FlashcardResponseDTO }>>('/api/flashcards', data);
        return response.data.data!.flashcard;
    },

    updateFlashcard: async (data: FlashcardUpdateDTO): Promise<FlashcardResponseDTO> => {
        const response = await apiClient.patch<StandardApiResponse<{ flashcard: FlashcardResponseDTO }>>('/api/flashcards', data);
        return response.data.data!.flashcard;
    },

    deleteFlashcard: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/flashcards/${id}`);
    },

    // --- REVIEWS ---

    getCardsDue: async (params: { deckId?: string; limit?: number }): Promise<any[]> => {
        const response = await apiClient.post<StandardApiResponse<{ flashcards: any[] }>>('/api/flashcards/reviews/due', params);
        return response.data.data!.flashcards;
    },

    submitReview: async (data: { flashcardId: string; deckId: string; quality: number; timeSpent: number; sessionId?: string }): Promise<any> => {
        const response = await apiClient.post<StandardApiResponse<{ review: any }>>('/api/flashcards/reviews/submit', data);
        return response.data.data!.review;
    },

    startSession: async (data: { deckId: string; studyMode?: string }): Promise<any> => {
        const response = await apiClient.post<StandardApiResponse<{ session: any }>>('/api/flashcards/reviews/sessions', data);
        if (!response.data.success) throw new Error(response.data.message || 'Failed to start session');
        return response.data.data!.session;
    },

    completeSession: async (sessionId: string, data: { durationSeconds?: number } = {}): Promise<any> => {
        const response = await apiClient.patch<StandardApiResponse<{ session: any }>>(`/api/flashcards/reviews/sessions/${sessionId}/complete`, data);
        if (!response.data.success) throw new Error(response.data.message || 'Failed to complete session');
        return response.data.data!.session;
    },

    getDeckById: async (id: string): Promise<FlashcardDeckResponseDTO> => {
        const response = await apiClient.get<StandardApiResponse<{ deck: FlashcardDeckResponseDTO }>>(`/api/flashcard-decks/${id}`);
        if (!response.data.success) throw new Error(response.data.message || 'Failed to get deck');
        return response.data.data!.deck;
    },

    bulkOperations: async (data: BulkFlashcardOperationsDTO): Promise<BulkFlashcardOperationsResponseDTO> => {
        const response = await apiClient.post<StandardApiResponse<BulkFlashcardOperationsResponseDTO>>('/api/flashcards/bulk', data);
        return response.data.data!;
    },

    getUserProgress: async (flashcardId: string): Promise<any> => {
        const response = await apiClient.get<StandardApiResponse<{ progress: any }>>(`/api/flashcards/reviews/progress/${flashcardId}`);
        return response.data.data!.progress;
    },

    getRecentSessions: async (params: { deckId?: string; limit?: number }): Promise<any[]> => {
        const response = await apiClient.post<StandardApiResponse<{ sessions: any[] }>>('/api/flashcards/reviews/sessions', params);
        return response.data.data!.sessions;
    }
};
