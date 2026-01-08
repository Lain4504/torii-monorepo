import type { Review, Prisma } from '@prisma/generated';

/**
 * Review Repository Interface
 * Defines the contract for all review data access operations
 */
export interface IReviewRepository {
    /**
     * Find review by ID
     * @param reviewId - The review's unique identifier
     * @returns The review if found, null otherwise
     */
    findById(reviewId: string): Promise<Review | null>;

    /**
     * Find review by userId and courseId
     * @param userId - The user's unique identifier
     * @param courseId - The course's unique identifier
     * @returns The review if found, null otherwise
     */
    findByUserAndCourse(
        userId: string,
        courseId: string,
    ): Promise<Review | null>;

    /**
     * Find reviews by course ID with pagination and relations
     * @param options - Query options including courseId, skip, take, and includeUser
     * @returns Array of reviews with optional user relations
     */
    findManyByCourseId(options: {
        courseId: string;
        skip: number;
        take: number;
        includeUser?: boolean;
    }): Promise<
        (Review & {
            user?: { id: string; displayName: string; avatarUrl: string | null };
        })[]
    >;

    /**
     * Find all reviews by course ID (for rating distribution)
     * @param courseId - The course's unique identifier
     * @returns Array of reviews with rating only
     */
    findAllByCourseId(courseId: string): Promise<Pick<Review, 'rating'>[]>;

    /**
     * Count reviews by course ID
     * @param courseId - The course's unique identifier
     * @returns Total count of reviews for the course
     */
    countByCourseId(courseId: string): Promise<number>;

    /**
     * Count reviews with optional filter
     * @param where - Optional filter criteria
     * @returns Total count of reviews matching the criteria
     */
    count(where?: Prisma.ReviewWhereInput): Promise<number>;

    /**
     * Create new review
     * @param data - Review creation data
     * @returns The created review with user relation
     */
    create(data: {
        userId: string;
        courseId: string;
        rating: number;
        comment?: string | null;
    }): Promise<Review & { user: { id: string; displayName: string; avatarUrl: string | null } }>;

    /**
     * Delete review by ID
     * @param reviewId - The review's unique identifier
     */
    delete(reviewId: string): Promise<void>;

    /**
     * Find course by ID (helper for validation)
     * @param courseId - The course's unique identifier
     * @returns Course info if found, null otherwise
     */
    findCourse(courseId: string): Promise<{ id: string } | null>;

    /**
     * Update course rating statistics
     * @param courseId - The course's unique identifier
     * @param averageRating - The average rating value
     * @param totalReviews - The total number of reviews
     */
    updateCourseRatingStats(
        courseId: string,
        averageRating: number,
        totalReviews: number,
    ): Promise<void>;
}
