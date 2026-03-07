import { apiClient } from '../api-client';
import type { StandardApiResponse } from '@workspace/schemas';

export interface Note {
    id: string;
    userId: string;
    content: string;
    lessonId?: string;
    tags?: string[];
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
}

export interface CreateNoteDTO {
    content: string;
    lessonId?: string;
    tags?: string[];
    metadata?: Record<string, any>;
}

export interface UpdateNoteDTO {
    content?: string;
    tags?: string[];
    metadata?: Record<string, any>;
}

export interface GetNotesQuery {
    lessonId?: string;
    tags?: string[];
    search?: string;
}

export const noteApi = {
    // Create a new note
    create: async (data: CreateNoteDTO): Promise<Note> => {
        const response = await apiClient.post<StandardApiResponse<Note>>('/api/notes', data);
        if (!response.data.success) throw new Error(response.data.message || 'Failed to create note');
        return response.data.data!;
    },

    // Get all notes (with optional filters)
    getAll: async (query: GetNotesQuery = {}): Promise<Note[]> => {
        const response = await apiClient.get<StandardApiResponse<Note[]>>('/api/notes', { params: query });
        if (!response.data.success) throw new Error(response.data.message || 'Failed to fetch notes');
        return response.data.data!;
    },

    // Update a note
    update: async (id: string, data: UpdateNoteDTO): Promise<Note> => {
        const response = await apiClient.patch<StandardApiResponse<Note>>(`/api/notes/${id}`, data);
        if (!response.data.success) throw new Error(response.data.message || 'Failed to update note');
        return response.data.data!;
    },

    // Delete a note
    delete: async (id: string): Promise<void> => {
        const response = await apiClient.delete<StandardApiResponse<void>>(`/api/notes/${id}`);
        if (!response.data.success) throw new Error(response.data.message || 'Failed to delete note');
    },

    // Convert note to flashcard
    convertToFlashcard: async (id: string, deckId?: string): Promise<any> => {
        const response = await apiClient.post<StandardApiResponse<any>>(`/api/notes/${id}/to-flashcard`, { deckId });
        if (!response.data.success) throw new Error(response.data.message || 'Failed to convert note to flashcard');
        return response.data.data!;
    },
};
