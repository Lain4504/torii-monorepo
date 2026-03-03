import type { Review, Prisma } from '@prisma/generated';

/**
 * Type for Review with relations included
 */
export type ReviewWithRelations = Prisma.ReviewGetPayload<{
    include: {
        user: {
            select: { id: true; displayName: true; avatarUrl: true };
        };
        courseRun: {
            select: { id: true; courseMasterId: true };
        };
    };
}>;

/**
 * Review Repository Interface
 * Defines the contract for all review data access operations
 */
export interface IReviewRepository {
    /**
     * Find review by ID
     * @param reviewId - The review's unique identifier
     * @param includeRelations - Whether to include user and course relations
     * @returns The review if found, null otherwise
     */
    findById(reviewId: string, includeRelations?: false): Promise<Review | null>;
    findById(reviewId: string, includeRelations: true): Promise<ReviewWithRelations | null>;
    findById(reviewId: string, includeRelations?: boolean): Promise<Review | ReviewWithRelations | null>;

    /**
     * Find review by userId and courseRunId
     * @param userId - The user's unique identifier
     * @param courseRunId - The run's unique identifier
     * @returns The review if found, null otherwise
     */
    findByUserAndCourseRun(
        userId: string,
        courseRunId: string,
    ): Promise<Review | null>;

    /**
     * Find reviews by course ID with pagination and relations
     * @param options - Query options including courseMasterId, skip, take, and includeUser
     * @returns Array of reviews with optional user relations
     */
    findManyByCourseId(options: {
        courseMasterId: string;
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
     * @param courseMasterId - The course's unique identifier
     * @returns Array of reviews with rating only
     */
    findAllByCourseId(courseMasterId: string): Promise<Pick<Review, 'rating'>[]>;

    /**
     * Count reviews by course ID
     * @param courseMasterId - The course's unique identifier
     * @returns Total count of reviews for the course
     */
    countByCourseId(courseMasterId: string): Promise<number>;

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
        courseRunId: string;
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
     * @param courseMasterId - The course's unique identifier
     * @returns Course info if found, null otherwise
     */
    findCourse(courseMasterId: string): Promise<{ id: string } | null>;

    /**
     * Update course rating statistics
     * @param courseMasterId - The course's unique identifier
     * @param averageRating - The average rating value
     * @param totalReviews - The total number of reviews
     */
    updateCourseRatingStats(
        courseMasterId: string,
        averageRating: number,
        totalReviews: number,
    ): Promise<void>;

    /**
     * Find course run by ID (helper for validation)
     * @param courseRunId - The run's unique identifier
     * @returns Course run info with master if found, null otherwise
     */
    findCourseRun(courseRunId: string): Promise<any | null>;
}
