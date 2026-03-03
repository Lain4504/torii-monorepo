import type { FlashcardDeck, Prisma } from '@prisma/generated';

/**
 * Flashcard Deck Repository Interface
 */
export interface IFlashcardDeckRepository {
    findById(id: string, include?: Prisma.FlashcardDeckInclude): Promise<FlashcardDeck | null>;
    findAll(options: {
        skip: number;
        take: number;
        where?: Prisma.FlashcardDeckWhereInput;
        orderBy?: Prisma.FlashcardDeckOrderByWithRelationInput;
        include?: Prisma.FlashcardDeckInclude;
    }): Promise<FlashcardDeck[]>;
    count(where?: Prisma.FlashcardDeckWhereInput): Promise<number>;
    create(data: Prisma.FlashcardDeckCreateInput): Promise<FlashcardDeck>;
    update(id: string, data: Prisma.FlashcardDeckUpdateInput): Promise<FlashcardDeck>;
    delete(id: string): Promise<void>;
}

export const FLASHCARD_DECK_REPOSITORY_TOKEN = Symbol('FLASHCARD_DECK_REPOSITORY_TOKEN');
