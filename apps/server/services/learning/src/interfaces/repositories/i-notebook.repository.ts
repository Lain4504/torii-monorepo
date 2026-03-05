import type { Notebook, NoteEntry, Prisma } from '@prisma/generated';

export interface INotebookRepository {
  // Notebook CRUD
  /**
   * Find by id.
   */
  findById(
    id: string,
    include?: Prisma.NotebookInclude,
  ): Promise<Notebook | null>;
  /**
   * Find all.
   */
  findAll(options: {
    skip: number;
    take: number;
    where?: Prisma.NotebookWhereInput;
    orderBy?: Prisma.NotebookOrderByWithRelationInput;
    include?: Prisma.NotebookInclude;
  }): Promise<Notebook[]>;
  /**
   * Count data.
   */
  count(where?: Prisma.NotebookWhereInput): Promise<number>;
  /**
   * Create data.
   */
  create(data: Prisma.NotebookCreateInput): Promise<Notebook>;
  /**
   * Update data.
   */
  update(id: string, data: Prisma.NotebookUpdateInput): Promise<Notebook>;
  /**
   * Delete data.
   */
  delete(id: string): Promise<void>;

  // NoteEntry CRUD
  /**
   * Find entry by id.
   */
  findEntryById(id: string): Promise<NoteEntry | null>;
  /**
   * Create entry.
   */
  createEntry(data: Prisma.NoteEntryCreateInput): Promise<NoteEntry>;
  /**
   * Update entry.
   */
  updateEntry(
    id: string,
    data: Prisma.NoteEntryUpdateInput,
  ): Promise<NoteEntry>;
  /**
   * Delete entry.
   */
  deleteEntry(id: string): Promise<void>;
  /**
   * Execute bulk create entries operation.
   */
  bulkCreateEntries(
    notebookId: string,
    entries: Omit<Prisma.NoteEntryCreateManyInput, 'notebookId'>[],
  ): Promise<number>;
}

export const NOTEBOOK_REPOSITORY_TOKEN = Symbol('NOTEBOOK_REPOSITORY_TOKEN');
