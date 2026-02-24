import { apiClient } from '../api-client';
import type { StandardApiResponse } from '@workspace/schemas';

export interface NoteEntryDTO {
    id: string;
    word: string;
    phonetic?: string;
    meaning: string;
    note?: string;
    partOfSpeech: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface NotebookDTO {
    id: string;
    userId: string;
    name: string;
    description?: string;
    isPublic: boolean;
    entries: NoteEntryDTO[];
    entryCount: number;
    createdAt: string;
    updatedAt: string;
}

export const notebookApi = {
    async getMyNotebooks(search?: string): Promise<NotebookDTO[]> {
        const response = await apiClient.get<StandardApiResponse<{ notebooks: NotebookDTO[] }>>('/api/notebooks', {
            params: { search }
        });
        return response.data.data!.notebooks;
    },

    async getPublicNotebooks(search?: string): Promise<NotebookDTO[]> {
        const response = await apiClient.get<StandardApiResponse<{ notebooks: NotebookDTO[] }>>('/api/notebooks/public', {
            params: { search }
        });
        return response.data.data!.notebooks;
    },

    async getNotebook(id: string): Promise<NotebookDTO> {
        const response = await apiClient.get<StandardApiResponse<{ notebook: NotebookDTO }>>(`/api/notebooks/${id}`);
        return response.data.data!.notebook;
    },

    async createNotebook(input: { name: string; description?: string; isPublic: boolean }): Promise<NotebookDTO> {
        const response = await apiClient.post<StandardApiResponse<{ notebook: NotebookDTO }>>('/api/notebooks', input);
        return response.data.data!.notebook;
    },

    async updateNotebook(id: string, input: { name?: string; description?: string; isPublic?: boolean }): Promise<NotebookDTO> {
        const response = await apiClient.patch<StandardApiResponse<{ notebook: NotebookDTO }>>(`/api/notebooks/${id}`, input);
        return response.data.data!.notebook;
    },

    async deleteNotebook(id: string): Promise<void> {
        await apiClient.delete(`/api/notebooks/${id}`);
    },

    async addEntry(notebookId: string, entry: Omit<NoteEntryDTO, 'id'>): Promise<NoteEntryDTO> {
        const response = await apiClient.post<StandardApiResponse<{ entry: NoteEntryDTO }>>(`/api/notebooks/${notebookId}/entries`, entry);
        return response.data.data!.entry;
    },

    async updateEntry(notebookId: string, entryId: string, entry: Partial<Omit<NoteEntryDTO, 'id'>>): Promise<NoteEntryDTO> {
        const response = await apiClient.patch<StandardApiResponse<{ entry: NoteEntryDTO }>>(`/api/notebooks/${notebookId}/entries/${entryId}`, entry);
        return response.data.data!.entry;
    },

    async deleteEntry(notebookId: string, entryId: string): Promise<void> {
        await apiClient.delete(`/api/notebooks/${notebookId}/entries/${entryId}`);
    },

    async bulkCreateEntries(notebookId: string, entries: Omit<NoteEntryDTO, 'id'>[]): Promise<{ count: number }> {
        const response = await apiClient.post<StandardApiResponse<{ count: number }>>(`/api/notebooks/${notebookId}/entries/bulk`, { entries });
        return response.data.data!;
    }
}
