import { apiClient } from '../api-client';

export interface NoteEntryDTO {
    id: string;
    notebookId: string;
    word: string;
    phonetic?: string;
    meaning: string;
    note?: string;
    partOfSpeech: string;
    createdAt: string;
    updatedAt: string;
}

export interface NotebookDTO {
    id: string;
    userId: string;
    name: string;
    description?: string;
    isPublic: boolean;
    entryCount: number;
    entries: NoteEntryDTO[];
    createdAt: string;
    updatedAt: string;
}

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
}

export const notebookApi = {
    // ── Notebooks ─────────────────────────────────────────────────

    getMyNotebooks: async (search?: string): Promise<NotebookDTO[]> => {
        const response = await apiClient.get<ApiResponse<{ notebooks: NotebookDTO[] }>>('/api/notebooks', {
            params: search ? { search } : undefined,
        });
        return response.data.data?.notebooks ?? [];
    },

    getPublicNotebooks: async (search?: string): Promise<NotebookDTO[]> => {
        const response = await apiClient.get<ApiResponse<{ notebooks: NotebookDTO[] }>>('/api/notebooks/public', {
            params: search ? { search } : undefined,
        });
        return response.data.data?.notebooks ?? [];
    },

    getNotebook: async (id: string): Promise<NotebookDTO> => {
        const response = await apiClient.get<ApiResponse<{ notebook: NotebookDTO }>>(`/api/notebooks/${id}`);
        return response.data.data!.notebook;
    },

    createNotebook: async (data: { name: string; description?: string; isPublic?: boolean }): Promise<NotebookDTO> => {
        const response = await apiClient.post<ApiResponse<{ notebook: NotebookDTO }>>('/api/notebooks', data);
        return response.data.data!.notebook;
    },

    updateNotebook: async (id: string, data: { name?: string; description?: string; isPublic?: boolean }): Promise<NotebookDTO> => {
        const response = await apiClient.patch<ApiResponse<{ notebook: NotebookDTO }>>(`/api/notebooks/${id}`, data);
        return response.data.data!.notebook;
    },

    deleteNotebook: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/notebooks/${id}`);
    },

    // ── NoteEntries ───────────────────────────────────────────────

    addEntry: async (
        notebookId: string,
        data: { word: string; phonetic?: string; meaning: string; note?: string; partOfSpeech?: string },
    ): Promise<NoteEntryDTO> => {
        const response = await apiClient.post<ApiResponse<{ entry: NoteEntryDTO }>>(`/api/notebooks/${notebookId}/entries`, data);
        return response.data.data!.entry;
    },

    updateEntry: async (
        notebookId: string,
        entryId: string,
        data: { word?: string; phonetic?: string; meaning?: string; note?: string; partOfSpeech?: string },
    ): Promise<NoteEntryDTO> => {
        const response = await apiClient.patch<ApiResponse<{ entry: NoteEntryDTO }>>(`/api/notebooks/${notebookId}/entries/${entryId}`, data);
        return response.data.data!.entry;
    },

    deleteEntry: async (notebookId: string, entryId: string): Promise<void> => {
        await apiClient.delete(`/api/notebooks/${notebookId}/entries/${entryId}`);
    },

    bulkCreateEntries: async (
        notebookId: string,
        entries: { word: string; phonetic?: string; meaning: string; note?: string; partOfSpeech?: string }[],
    ): Promise<{ count: number }> => {
        const response = await apiClient.post<ApiResponse<{ count: number }>>(`/api/notebooks/${notebookId}/entries/bulk`, { entries });
        return response.data.data!;
    },
};
