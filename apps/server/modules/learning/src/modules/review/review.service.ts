import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import {
  type ReviewCreateDTO,
  type ReviewQueryDTO,
  type ReviewResponseDTO,
  type PaginatedReviewResponseDTO,
  type RatingDistributionDTO,
} from '@workspace/schemas';
import { ReviewRepository } from './review.repository';
import type { IReviewService } from '../../interfaces/services';

@Injectable()
export class ReviewService implements IReviewService {
  private readonly logger = new Logger(ReviewService.name);

  constructor(private readonly reviewRepository: ReviewRepository) {}

  /**
   * Map Review entity to ReviewResponseDTO
   */
  private toReviewResponseDto(review: any): ReviewResponseDTO {
    return {
      id: review.id,
      userId: review.userId,
      courseId: review.courseId,
      rating: review.rating,
      comment: review.comment || undefined,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      user: {
        id: review.user.id,
        displayName: review.user.displayName,
        avatarUrl: review.user.avatarUrl || undefined,
      },
    };
  }

  /**
   * Get reviews by course ID with pagination
   */
  async findByCourseId(
    courseId: string,
    query: ReviewQueryDTO,
  ): Promise<PaginatedReviewResponseDTO> {
    try {
      const { page = 1, limit = 10 } = query;
      const pageNum = parseInt(String(page || 1), 10);
      const limitNum = parseInt(String(limit || 10), 10);
      const skip = (pageNum - 1) * limitNum;

      const [total, reviews] = await Promise.all([
        this.reviewRepository.countByCourseId(courseId),
        this.reviewRepository.findManyByCourseId({
          courseId,
          skip,
          take: limitNum,
          includeUser: true,
        }),
      ]);

      const totalPages = Math.ceil(total / limitNum);

      return {
        data: reviews.map((review) => this.toReviewResponseDto(review)),
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      };
    } catch (error: any) {
      this.logger.error('Failed to retrieve reviews', error);
      return {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
    }
  }

  /**
   * Get rating distribution for a course
   */
  async getRatingDistribution(
    courseId: string,
  ): Promise<RatingDistributionDTO> {
    try {
      const reviews = await this.reviewRepository.findAllByCourseId(courseId);

      const totalReviews = reviews.length;
      const distribution = [1, 2, 3, 4, 5].map((stars) => {
        const count = reviews.filter((r) => r.rating === stars).length;
        const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
        return { stars, count, percent: Math.round(percent * 10) / 10 };
      });

      const averageRating =
        totalReviews > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          : 0;

      return {
        courseId,
        distribution,
        averageRating: Math.round(averageRating * 100) / 100,
        totalReviews,
      };
    } catch (error: any) {
      this.logger.error('Failed to get rating distribution', error);
      return {
        courseId,
        distribution: [1, 2, 3, 4, 5].map((stars) => ({
          stars,
          count: 0,
          percent: 0,
        })),
        averageRating: 0,
        totalReviews: 0,
      };
    }
  }

  /**
   * Create a new review
   */
  async create(
    userId: string,
    courseId: string,
    input: ReviewCreateDTO,
  ): Promise<ReviewResponseDTO> {
    try {
      // Check if course exists
      const course = await this.reviewRepository.findCourse(courseId);

      if (!course) {
        throw new RpcException({
          status: 404,
          message: `Course with id ${courseId} not found`,
        });
      }

      // Check if user already reviewed this course
      const existingReview = await this.reviewRepository.findByUserAndCourse(
        userId,
        courseId,
      );

      if (existingReview) {
        throw new RpcException({
          status: 400,
          message: 'You have already reviewed this course',
        });
      }

      // Create review
      const review = await this.reviewRepository.create({
        userId,
        courseId,
        rating: input.rating,
        comment: input.comment || null,
      });

      // Update course averageRating and totalReviews
      await this.updateCourseRatingStats(courseId);

      return this.toReviewResponseDto(review);
    } catch (error: any) {
      this.logger.error('Error creating review', error);
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        status: 400,
        message: `Failed to create review: ${error?.message || 'Unknown error'}`,
      });
    }
  }

  /**
   * Update course rating statistics
   */
  private async updateCourseRatingStats(courseId: string): Promise<void> {
    try {
      const reviews = await this.reviewRepository.findAllByCourseId(courseId);

      const totalReviews = reviews.length;
      const averageRating =
        totalReviews > 0
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          : 0;

      await this.reviewRepository.updateCourseRatingStats(
        courseId,
        averageRating,
        totalReviews,
      );
    } catch (error: any) {
      this.logger.error('Failed to update course rating stats', error);
      // Don't throw - this is a background update
    }
  }

  /**
   * Delete a review
   */
  async delete(reviewId: string, userId: string): Promise<boolean> {
    try {
      const review = await this.reviewRepository.findById(reviewId);

      if (!review) {
        throw new RpcException({
          status: 404,
          message: `Review with id ${reviewId} not found`,
        });
      }

      // Check if user owns this review
      if (review.userId !== userId) {
        throw new RpcException({
          status: 403,
          message: 'You can only delete your own reviews',
        });
      }

      const courseId = review.courseId;

      await this.reviewRepository.delete(reviewId);

      // Update course rating stats
      await this.updateCourseRatingStats(courseId);

      return true;
    } catch (error: any) {
      this.logger.error('Error deleting review', error);
      if (error instanceof RpcException) {
        throw error;
      }
      throw new RpcException({
        status: 400,
        message: `Failed to delete review: ${error?.message || 'Unknown error'}`,
      });
    }
  }
}
