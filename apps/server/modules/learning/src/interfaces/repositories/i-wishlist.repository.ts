import type { Wishlist, Prisma } from '@prisma/generated';

/**
 * Wishlist Repository Interface
 * Defines the contract for all wishlist data access operations
 */
export interface IWishlistRepository {
    /**
     * Find wishlist by ID
     */
    findById(id: string): Promise<Wishlist | null>;

    /**
     * Find wishlist by user and course run
     */
    findByUserAndCourseRun(userId: string, courseRunId: string): Promise<Wishlist | null>;

    /**
     * Find all wishlists with pagination and filters
     */
    findMany(options: {
        skip: number;
        take: number;
        where?: Prisma.WishlistWhereInput;
        orderBy?: Prisma.WishlistOrderByWithRelationInput;
    }): Promise<Wishlist[]>;

    /**
     * Count wishlists with optional filter
     */
    count(where?: Prisma.WishlistWhereInput): Promise<number>;

    /**
     * Create a new wishlist
     */
    create(data: Prisma.WishlistCreateInput): Promise<Wishlist>;

    /**
     * Delete wishlist by ID
     */
    delete(id: string): Promise<void>;
}

