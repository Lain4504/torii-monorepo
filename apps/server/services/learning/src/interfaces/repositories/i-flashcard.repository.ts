import type { Flashcard, Prisma } from '@prisma/generated';

/**
 * Flashcard Repository Interface
 */
export interface IFlashcardRepository {
    findById(id: string): Promise<Flashcard | null>;
    findAll(options: {
        skip: number;
        take: number;
        where?: Prisma.FlashcardWhereInput;
        orderBy?: Prisma.FlashcardOrderByWithRelationInput;
        include?: Prisma.FlashcardInclude;
    }): Promise<Flashcard[]>;
    count(where?: Prisma.FlashcardWhereInput): Promise<number>;
    create(data: Prisma.FlashcardCreateInput): Promise<Flashcard>;
    update(id: string, data: Prisma.FlashcardUpdateInput): Promise<Flashcard>;
    delete(id: string): Promise<void>;

    // Bulk operations
    deleteMany(where: Prisma.FlashcardWhereInput): Promise<{ count: number }>;
}

export const FLASHCARD_REPOSITORY_TOKEN = Symbol('FLASHCARD_REPOSITORY_TOKEN');
