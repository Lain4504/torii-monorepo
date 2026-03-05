import type { Flashcard, Prisma } from '@prisma/generated';

/**
 * Flashcard Repository Interface
 */
export interface IFlashcardRepository {
  /**
   * Find by id.
   */
  findById(id: string): Promise<Flashcard | null>;
  /**
   * Find all.
   */
  findAll(options: {
    skip: number;
    take: number;
    where?: Prisma.FlashcardWhereInput;
    orderBy?: Prisma.FlashcardOrderByWithRelationInput;
    include?: Prisma.FlashcardInclude;
  }): Promise<Flashcard[]>;
  /**
   * Count data.
   */
  count(where?: Prisma.FlashcardWhereInput): Promise<number>;
  /**
   * Create data.
   */
  create(data: Prisma.FlashcardCreateInput): Promise<Flashcard>;
  /**
   * Update data.
   */
  update(id: string, data: Prisma.FlashcardUpdateInput): Promise<Flashcard>;
  /**
   * Delete data.
   */
  delete(id: string): Promise<void>;

  // Bulk operations
  /**
   * Delete many.
   */
  deleteMany(where: Prisma.FlashcardWhereInput): Promise<{ count: number }>;
}

export const FLASHCARD_REPOSITORY_TOKEN = Symbol('FLASHCARD_REPOSITORY_TOKEN');
