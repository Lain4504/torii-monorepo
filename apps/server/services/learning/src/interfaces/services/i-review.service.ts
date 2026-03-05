import type {
  ReviewCreateDTO,
  ReviewQueryDTO,
  ReviewResponseDTO,
  PaginatedReviewResponseDTO,
  RatingDistributionDTO,
} from '@workspace/schemas';

/**
 * Review Service Interface
 * Defines the contract for review business logic operations
 */
export interface IReviewService {
  /**
   * Get reviews by course ID with pagination
   * @param courseMasterId - The course's unique identifier
   * @param query - Query parameters including pagination
   * @returns Paginated response of reviews
   */
  findByCourseId(
    courseMasterId: string,
    query: ReviewQueryDTO,
  ): Promise<PaginatedReviewResponseDTO>;

  /**
   * Get rating distribution for a course
   * @param courseMasterId - The course's unique identifier
   * @returns Rating distribution data
   */
  getRatingDistribution(courseMasterId: string): Promise<RatingDistributionDTO>;

  /**
   * Create a new review
   * @param userId - The user's unique identifier
   * @param input - Review creation data
   * @returns The created review
   * @throws RpcException if course not found or user already reviewed
   */
  create(userId: string, input: ReviewCreateDTO): Promise<ReviewResponseDTO>;

  /**
   * Delete a review
   * @param reviewId - The review's unique identifier
   * @param userId - The user's unique identifier
   * @returns True if deleted successfully
   * @throws RpcException if review not found or user doesn't own the review
   */
  delete(reviewId: string, userId: string): Promise<boolean>;
}
