import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { Review, Prisma } from '@prisma/generated';

/**
 * Review Repository
 * Handles all database operations for Review entity
 */
@Injectable()
export class ReviewRepository {
  private readonly logger = new Logger(ReviewRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find review by ID
   */
  async findById(reviewId: string): Promise<Review | null> {
    return this.prisma.review.findUnique({
      where: { id: reviewId },
    });
  }

  /**
   * Find review by userId and courseId (unique constraint)
   */
  async findByUserAndCourse(
    userId: string,
    courseId: string,
  ): Promise<Review | null> {
    return this.prisma.review.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });
  }

  /**
   * Find reviews by course ID with pagination and relations
   */
  async findManyByCourseId(options: {
    courseId: string;
    skip: number;
    take: number;
    includeUser?: boolean;
  }): Promise<
    (Review & {
      user?: { id: string; displayName: string; avatarUrl: string | null };
    })[]
  > {
    const { courseId, skip, take, includeUser = false } = options;

    const result = await this.prisma.review.findMany({
      where: { courseId },
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
   * Find all reviews by course ID (for rating distribution)
   */
  async findAllByCourseId(courseId: string): Promise<Pick<Review, 'rating'>[]> {
    return this.prisma.review.findMany({
      where: { courseId },
      select: { rating: true },
    });
  }

  /**
   * Count reviews by course ID
   */
  async countByCourseId(courseId: string): Promise<number> {
    return this.prisma.review.count({
      where: { courseId },
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
    courseId: string;
    rating: number;
    comment?: string | null;
  }): Promise<Review & { user: { id: string; displayName: string; avatarUrl: string | null } }> {
    return this.prisma.review.create({
      data: {
        userId: data.userId,
        courseId: data.courseId,
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
   * Find course by ID (helper for validation)
   */
  async findCourse(courseId: string): Promise<{ id: string } | null> {
    return this.prisma.course.findFirst({
      where: { id: courseId, deletedAt: null },
      select: { id: true },
    });
  }

  /**
   * Update course rating statistics
   */
  async updateCourseRatingStats(
    courseId: string,
    averageRating: number,
    totalReviews: number,
  ): Promise<void> {
    await this.prisma.course.update({
      where: { id: courseId },
      data: {
        averageRating: Math.round(averageRating * 100) / 100,
        totalReviews,
      },
    });
  }
}