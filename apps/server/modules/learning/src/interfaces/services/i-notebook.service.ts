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
    createNotebook(data: CreateNotebookDTO & { userId: string }): Promise<NotebookResponseDTO>;
    findAllNotebooks(params: { userId: string; search?: string }): Promise<NotebookResponseDTO[]>;
    findPublicNotebooks(params: { search?: string; excludeUserId?: string }): Promise<NotebookResponseDTO[]>;
    findOneNotebook(id: string, userId: string): Promise<NotebookResponseDTO>;
    updateNotebook(id: string, data: UpdateNotebookDTO, userId: string): Promise<NotebookResponseDTO>;
    deleteNotebook(id: string, userId: string): Promise<void>;

    // NoteEntry
    addEntry(notebookId: string, data: CreateNoteEntryDTO, userId: string): Promise<NoteEntryResponseDTO>;
    updateEntry(notebookId: string, entryId: string, data: UpdateNoteEntryDTO, userId: string): Promise<NoteEntryResponseDTO>;
    deleteEntry(notebookId: string, entryId: string, userId: string): Promise<void>;
    bulkCreateEntries(notebookId: string, data: BulkCreateEntriesDTO, userId: string): Promise<{ count: number }>;
}

export const NOTEBOOK_SERVICE_TOKEN = Symbol('NOTEBOOK_SERVICE_TOKEN');
