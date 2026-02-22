import type { Notebook, NoteEntry, Prisma } from '@prisma/generated';

export interface INotebookRepository {
    // Notebook CRUD
    findById(id: string, include?: Prisma.NotebookInclude): Promise<Notebook | null>;
    findAll(options: {
        skip: number;
        take: number;
        where?: Prisma.NotebookWhereInput;
        orderBy?: Prisma.NotebookOrderByWithRelationInput;
        include?: Prisma.NotebookInclude;
    }): Promise<Notebook[]>;
    count(where?: Prisma.NotebookWhereInput): Promise<number>;
    create(data: Prisma.NotebookCreateInput): Promise<Notebook>;
    update(id: string, data: Prisma.NotebookUpdateInput): Promise<Notebook>;
    delete(id: string): Promise<void>;

    // NoteEntry CRUD
    findEntryById(id: string): Promise<NoteEntry | null>;
    createEntry(data: Prisma.NoteEntryCreateInput): Promise<NoteEntry>;
    updateEntry(id: string, data: Prisma.NoteEntryUpdateInput): Promise<NoteEntry>;
    deleteEntry(id: string): Promise<void>;
    bulkCreateEntries(notebookId: string, entries: Omit<Prisma.NoteEntryCreateManyInput, 'notebookId'>[]): Promise<number>;
}

export const NOTEBOOK_REPOSITORY_TOKEN = Symbol('NOTEBOOK_REPOSITORY_TOKEN');
