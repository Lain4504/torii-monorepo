export interface NotebookResponseDTO {
    id: string;
    userId: string;
    name: string;
    description?: string;
    isPublic: boolean;
    entryCount: number;
    entries: NoteEntryResponseDTO[];
    createdAt: string;
    updatedAt: string;
}

export interface NoteEntryResponseDTO {
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

export interface CreateNotebookDTO {
    name: string;
    description?: string;
    isPublic?: boolean;
}

export interface UpdateNotebookDTO {
    name?: string;
    description?: string;
    isPublic?: boolean;
}

export interface CreateNoteEntryDTO {
    word: string;
    phonetic?: string;
    meaning: string;
    note?: string;
    partOfSpeech?: string;
}

export interface UpdateNoteEntryDTO {
    word?: string;
    phonetic?: string;
    meaning?: string;
    note?: string;
    partOfSpeech?: string;
}

export interface BulkCreateEntriesDTO {
    entries: CreateNoteEntryDTO[];
}

export interface INotebookService {
    // Notebook
    /**
     * Create notebook.
     */
    createNotebook(data: CreateNotebookDTO & { userId: string }): Promise<NotebookResponseDTO>;
    /**
     * Find all notebooks.
     */
    findAllNotebooks(params: { userId: string; search?: string }): Promise<NotebookResponseDTO[]>;
    /**
     * Find public notebooks.
     */
    findPublicNotebooks(params: { search?: string; excludeUserId?: string }): Promise<NotebookResponseDTO[]>;
    /**
     * Find one notebook.
     */
    findOneNotebook(id: string, userId: string): Promise<NotebookResponseDTO>;
    /**
     * Update notebook.
     */
    updateNotebook(id: string, data: UpdateNotebookDTO, userId: string): Promise<NotebookResponseDTO>;
    /**
     * Delete notebook.
     */
    deleteNotebook(id: string, userId: string): Promise<void>;

    // NoteEntry
    /**
     * Add entry.
     */
    addEntry(notebookId: string, data: CreateNoteEntryDTO, userId: string): Promise<NoteEntryResponseDTO>;
    /**
     * Update entry.
     */
    updateEntry(notebookId: string, entryId: string, data: UpdateNoteEntryDTO, userId: string): Promise<NoteEntryResponseDTO>;
    /**
     * Delete entry.
     */
    deleteEntry(notebookId: string, entryId: string, userId: string): Promise<void>;
    /**
     * Execute bulk create entries operation.
     */
    bulkCreateEntries(notebookId: string, data: BulkCreateEntriesDTO, userId: string): Promise<{ count: number }>;
}

export const NOTEBOOK_SERVICE_TOKEN = Symbol('NOTEBOOK_SERVICE_TOKEN');
