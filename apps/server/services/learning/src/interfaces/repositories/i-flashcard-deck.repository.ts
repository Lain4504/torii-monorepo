import type { FlashcardDeck, Prisma } from '@prisma/generated';

/**
 * Flashcard Deck Repository Interface
 */
export interface IFlashcardDeckRepository {
  /**
   * Find by id.
   */
  findById(
    id: string,
    include?: Prisma.FlashcardDeckInclude,
  ): Promise<FlashcardDeck | null>;
  /**
   * Find all.
   */
  findAll(options: {
    skip: number;
    take: number;
    where?: Prisma.FlashcardDeckWhereInput;
    orderBy?: Prisma.FlashcardDeckOrderByWithRelationInput;
    include?: Prisma.FlashcardDeckInclude;
  }): Promise<FlashcardDeck[]>;
  /**
   * Count data.
   */
  count(where?: Prisma.FlashcardDeckWhereInput): Promise<number>;
  /**
   * Create data.
   */
  create(data: Prisma.FlashcardDeckCreateInput): Promise<FlashcardDeck>;
  /**
   * Update data.
   */
  update(
    id: string,
    data: Prisma.FlashcardDeckUpdateInput,
  ): Promise<FlashcardDeck>;
  /**
   * Delete data.
   */
  delete(id: string): Promise<void>;
}

export const FLASHCARD_DECK_REPOSITORY_TOKEN = Symbol(
  'FLASHCARD_DECK_REPOSITORY_TOKEN',
);
