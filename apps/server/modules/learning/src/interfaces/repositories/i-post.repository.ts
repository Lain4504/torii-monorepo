import type { Post, Prisma } from '@prisma/generated';

/**
 * Post Repository Interface
 * Defines the contract for all post data access operations
 */
export interface IPostRepository {
    /**
     * Find post by ID
     */
    findById(id: string): Promise<Post | null>;

    /**
     * Find post by slug
     */
    findBySlug(slug: string): Promise<Post | null>;

    /**
     * Find multiple posts with pagination and filters
     */
    findMany(options: {
        skip: number;
        take: number;
        where?: Prisma.PostWhereInput;
        orderBy?: Prisma.PostOrderByWithRelationInput;
    }): Promise<Post[]>;

    /**
     * Count posts with optional filter
     */
    count(where?: Prisma.PostWhereInput): Promise<number>;

    /**
     * Create new post
     */
    create(data: Prisma.PostCreateInput): Promise<Post>;

    /**
     * Update post by ID
     */
    update(id: string, data: Prisma.PostUpdateInput): Promise<Post>;

    /**
     * Delete post (hard delete)
     */
    delete(id: string): Promise<void>;

    /**
     * Check if slug exists
     */
    slugExists(slug: string): Promise<boolean>;

    /**
     * Increment view count
     */
    incrementViewCount(id: string): Promise<Post>;

    /**
     * Increment like count
     */
    incrementLikeCount(id: string): Promise<Post>;

    /**
     * Decrement like count
     */
    decrementLikeCount(id: string): Promise<Post>;
}

