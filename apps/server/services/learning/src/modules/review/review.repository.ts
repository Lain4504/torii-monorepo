import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { Review, Prisma } from '@prisma/generated';
import type { IReviewRepository, ReviewWithRelations } from '@server/learning/interfaces/repositories';

/**
 * Review Repository
 * Handles all database operations for Review entity
 */
@Injectable()
export class ReviewRepository implements IReviewRepository {
  private readonly logger = new Logger(ReviewRepository.name);

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Find review by ID
   */
  async findById(reviewId: string, includeRelations?: false): Promise<Review | null>;
  async findById(reviewId: string, includeRelations: true): Promise<ReviewWithRelations | null>;
  async findById(reviewId: string, includeRelations = false): Promise<Review | ReviewWithRelations | null> {
    return this.prisma.review.findUnique({
      where: { id: reviewId },
      include: includeRelations ? {
        user: {
          select: { id: true, displayName: true, avatarUrl: true }
        },
        courseRun: {
          select: {
            id: true,
            courseMaster: {
              select: { id: true, title: true }
            }
          }
        }
      } : undefined
    });
  }

  /**
   * Find review by userId and courseMasterId
   */
  async findByUserAndCourseRun(
    userId: string,
    courseRunId: string,
  ): Promise<Review | null> {
    return this.prisma.review.findUnique({
      where: {
        userId_courseRunId: {
          userId,
          courseRunId,
        },
      },
    });
  }

  /**
   * Find reviews by course ID with pagination and relations
   */
  async findManyByCourseId(options: {
    courseMasterId: string;
    skip: number;
    take: number;
    includeUser?: boolean;
  }): Promise<
    (Review & {
      user?: { id: string; displayName: string; avatarUrl: string | null };
    })[]
  > {
    const { courseMasterId, skip, take, includeUser = false } = options;

    const result = await this.prisma.review.findMany({
      where: { courseRun: { courseMasterId } },
      include: includeUser
        ? {
          user: {
            select: {
              id: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        }
        : undefined,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });

    return result as (Review & {
      user?: { id: string; displayName: string; avatarUrl: string | null };
    })[];
  }

  /**
   * Find all reviews by course ID
   */
  async findAllByCourseId(courseMasterId: string): Promise<Pick<Review, 'rating'>[]> {
    return this.prisma.review.findMany({
      where: { courseRun: { courseMasterId } },
      select: { rating: true },
    });
  }
  /**
   * Find all reviews by course run ID
   */
  async findAllByCourseRunId(courseRunId: string): Promise<Pick<Review, 'rating'>[]> {
    return this.prisma.review.findMany({
      where: { courseRunId },
      select: { rating: true },
    });
  }

  /**
   * Count reviews by course ID
   */
  async countByCourseId(courseMasterId: string): Promise<number> {
    return this.prisma.review.count({
      where: { courseRun: { courseMasterId } },
    });
  }

  /**
   * Count reviews with optional filter
   */
  async count(where?: Prisma.ReviewWhereInput): Promise<number> {
    return this.prisma.review.count({ where });
  }

  /**
   * Create new review
   */
  async create(data: {
    userId: string;
    courseRunId: string;
    rating: number;
    comment?: string | null;
  }): Promise<Review & { user: { id: string; displayName: string; avatarUrl: string | null } }> {
    return this.prisma.review.create({
      data: {
        userId: data.userId,
        courseRunId: data.courseRunId,
        rating: data.rating,
        comment: data.comment || null,
      },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  /**
   * Delete review by ID
   */
  async delete(reviewId: string): Promise<void> {
    await this.prisma.review.delete({
      where: { id: reviewId },
    });
  }

  /**
   * Find course by ID
   */
  async findCourse(courseMasterId: string): Promise<{ id: string } | null> {
    return this.prisma.courseMaster.findFirst({
      where: { id: courseMasterId, deletedAt: null },
      select: { id: true },
    });
  }

  /**
   * Find many reviews with generic filtering
   */
  async findMany(args: Prisma.ReviewFindManyArgs): Promise<(Review & {
    user?: { id: string; displayName: string; avatarUrl: string | null };
    course?: { id: string; title: string };
  })[]> {
    return this.prisma.review.findMany(args) as any;
  }

  /**
   * Update course rating statistics
   */
  async updateCourseRatingStats(
    courseMasterId: string,
    averageRating: number,
    totalReviews: number,
  ): Promise<void> {
    // Note: Rating stats are now stored on CourseRun, not CourseMaster
    // This method is kept for backward compatibility but does nothing
  }

  /**
   * Update course run rating statistics
   */
  async updateCourseRunRatingStats(
    courseRunId: string,
    averageRating: number,
    totalReviews: number,
  ): Promise<void> {
    await this.prisma.courseRun.update({
      where: { id: courseRunId },
      data: {
        averageRating: Math.round(averageRating * 100) / 100,
        totalReviews,
      },
    });
  }

  /**
   * Find course run by ID
   */
  async findCourseRun(courseRunId: string): Promise<any | null> {
    return this.prisma.courseRun.findUnique({
      where: { id: courseRunId },
      include: { courseMaster: true }
    });
  }
}
