import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type {
  CourseMaster,
  CourseMasterReview,
  CourseVersion,
  Prisma,
} from '@prisma/generated';
import type { ICourseMasterRepository } from '@server/learning/interfaces/repositories';

/**
 * Course Repository
 * Handles all database operations for Course entity
 */
@Injectable()
export class CourseMasterRepository implements ICourseMasterRepository {
  private readonly logger = new Logger(CourseMasterRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find course master by ID
   */
  async findById(courseMasterId: string): Promise<CourseMaster | null> {
    return this.prisma.courseMaster.findUnique({
      where: { id: courseMasterId },
    });
  }

  /**
   * Find course master by slug
   */
  async findBySlug(slug: string): Promise<CourseMaster | null> {
    return this.prisma.courseMaster.findFirst({
      where: { slug },
    });
  }

  /**
   * Find all course masters with pagination and filtering
   */
  async findMany(options: {
    skip: number;
    take: number;
    where?: Prisma.CourseMasterWhereInput;
    orderBy?: Prisma.CourseMasterOrderByWithRelationInput;
    include?: Prisma.CourseMasterInclude;
  }): Promise<CourseMaster[]> {
    return this.prisma.courseMaster.findMany({
      where: options.where,
      skip: options.skip,
      take: options.take,
      orderBy: options.orderBy || { createdAt: 'desc' },
      include: options.include,
    });
  }

  /**
   * Count course masters with optional filter
   */
  async count(where?: Prisma.CourseMasterWhereInput): Promise<number> {
    return this.prisma.courseMaster.count({ where });
  }

  /**
   * Create new course master
   */
  async create(data: Prisma.CourseMasterCreateInput): Promise<CourseMaster> {
    return this.prisma.courseMaster.create({ data });
  }

  /**
   * Update course master by ID
   */
  async update(
    courseMasterId: string,
    data: Prisma.CourseMasterUpdateInput,
  ): Promise<CourseMaster> {
    return this.prisma.courseMaster.update({
      where: { id: courseMasterId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Delete course master (hard delete)
   */
  async delete(courseMasterId: string): Promise<void> {
    await this.prisma.courseMaster.delete({
      where: { id: courseMasterId },
    });
  }

  /**
   * Soft delete course master
   */
  async softDelete(courseMasterId: string): Promise<CourseMaster> {
    return this.prisma.courseMaster.update({
      where: { id: courseMasterId },
      data: {
        deletedAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Check if slug exists
   */
  async slugExists(slug: string, excludeId?: string): Promise<boolean> {
    const where: Prisma.CourseMasterWhereInput = { slug };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const course = await this.prisma.courseMaster.findFirst({ where });
    return !!course;
  }

  /**
   * Find course masters by type (vod or live)
   */
  async findByType(type: 'vod' | 'live'): Promise<CourseMaster[]> {
    return this.prisma.courseMaster.findMany({
      where: {
        type,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find featured course masters
   */
  async findFeatured(): Promise<CourseMaster[]> {
    return [];
  }

  /**
   * Get lecturer for a course master
   * Note: Lecturers are now assigned at the CourseRun level, not CourseMaster level
   */
  async getLecturer(courseMasterId: string): Promise<any | null> {
    return null;
  }

  /**
   * Create a new course version snapshot
   */
  async createVersion(
    data: Prisma.CourseVersionCreateInput,
  ): Promise<CourseVersion> {
    return this.prisma.courseVersion.create({ data });
  }

  /**
   * Get the latest published version for a course master
   */
  async getLatestVersion(
    courseMasterId: string,
  ): Promise<CourseVersion | null> {
    return this.prisma.courseVersion.findFirst({
      where: { courseMasterId },
      orderBy: { publishedAt: 'desc' },
    });
  }

  /**
   * Get a specific course version by ID
   */
  async getVersionById(versionId: string): Promise<CourseVersion | null> {
    return this.prisma.courseVersion.findUnique({
      where: { id: versionId },
    });
  }

  /**
   * Get all versions for a course master
   */
  async getVersions(courseMasterId: string): Promise<CourseVersion[]> {
    return this.prisma.courseVersion.findMany({
      where: { courseMasterId },
      orderBy: { publishedAt: 'desc' },
    });
  }

  /**
   * Count published lessons for a course master
   */
  /**
   * Count published curriculum items (lessons, quizzes, assignments) for a course master
   */
  async countLessons(courseMasterId: string): Promise<number> {
    return this.prisma.moduleItem.count({
      where: {
        module: {
          id: { not: undefined }, // basically ensure module exists
          courseMasterId,
          status: 'published',
          deletedAt: null,
        },
      },
    });
  }

  /**
   * Count published modules for a course master
   */
  async countModules(courseMasterId: string): Promise<number> {
    return this.prisma.module.count({
      where: {
        courseMasterId,
        status: 'published',
        deletedAt: null,
      },
    });
  }

  /**
   * Update course master statistics
   */
  async updateStats(
    courseMasterId: string,
    stats: { totalLessons: number; totalModules: number },
  ): Promise<void> {
    await this.prisma.courseMaster.update({
      where: { id: courseMasterId },
      data: {
        totalLessons: stats.totalLessons,
        totalModules: stats.totalModules,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Increment total students for a course master
   * Note: totalStudents is now on CourseRun, not CourseMaster
   */
  async incrementTotalStudents(courseMasterId: string): Promise<void> {
    // No-op: this method is kept for backward compatibility
  }

  /**
   * Create a new review record for a course master syllabus
   */
  async createMasterReview(
    data: Prisma.CourseMasterReviewCreateInput,
  ): Promise<CourseMasterReview> {
    return this.prisma.courseMasterReview.create({ data });
  }

  /**
   * Update an existing course master review
   */
  async updateMasterReview(
    id: string,
    data: Prisma.CourseMasterReviewUpdateInput,
  ): Promise<CourseMasterReview> {
    return this.prisma.courseMasterReview.update({
      where: { id },
      data,
    });
  }

  /**
   * List course master reviews with optional filtering and pagination
   */
  async findMasterReviews(options: {
    where?: Prisma.CourseMasterReviewWhereInput;
    orderBy?: Prisma.CourseMasterReviewOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }): Promise<CourseMasterReview[]> {
    return this.prisma.courseMasterReview.findMany({
      where: options.where,
      orderBy: options.orderBy,
      skip: options.skip,
      take: options.take,
    });
  }

  /**
   * Get the latest review entry for a course master
   */
  async getLatestMasterReview(
    courseMasterId: string,
  ): Promise<CourseMasterReview | null> {
    return this.prisma.courseMasterReview.findFirst({
      where: { courseMasterId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
