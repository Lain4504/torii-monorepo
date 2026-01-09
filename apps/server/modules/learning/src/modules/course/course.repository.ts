import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { Course, Prisma } from '@prisma/generated';
import type { ICourseRepository } from '../../interfaces/repositories';

/**
 * Course Repository
 * Handles all database operations for Course entity
 */
@Injectable()
export class CourseRepository implements ICourseRepository {
    private readonly logger = new Logger(CourseRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Find course by ID
     */
    async findById(courseId: string): Promise<Course | null> {
        return this.prisma.course.findUnique({
            where: { id: courseId },
        });
    }

    /**
     * Find course by slug
     */
    async findBySlug(slug: string): Promise<Course | null> {
        return this.prisma.course.findFirst({
            where: { slug },
        });
    }

    /**
     * Find all courses with pagination and filtering
     */
    async findMany(options: {
        skip: number;
        take: number;
        where?: Prisma.CourseWhereInput;
        orderBy?: Prisma.CourseOrderByWithRelationInput;
        include?: Prisma.CourseInclude;
    }): Promise<Course[]> {
        return this.prisma.course.findMany({
            where: options.where,
            skip: options.skip,
            take: options.take,
            orderBy: options.orderBy || { createdAt: 'desc' },
            include: options.include,
        });
    }

    /**
     * Count courses with optional filter
     */
    async count(where?: Prisma.CourseWhereInput): Promise<number> {
        return this.prisma.course.count({ where });
    }

    /**
     * Create new course
     */
    async create(data: Prisma.CourseCreateInput): Promise<Course> {
        return this.prisma.course.create({ data });
    }

    /**
     * Update course by ID
     */
    async update(courseId: string, data: Prisma.CourseUpdateInput): Promise<Course> {
        return this.prisma.course.update({
            where: { id: courseId },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });
    }

    /**
     * Delete course (hard delete)
     */
    async delete(courseId: string): Promise<void> {
        await this.prisma.course.delete({
            where: { id: courseId },
        });
    }

    /**
     * Soft delete course
     */
    async softDelete(courseId: string): Promise<Course> {
        return this.prisma.course.update({
            where: { id: courseId },
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
        const where: Prisma.CourseWhereInput = { slug };

        if (excludeId) {
            where.id = { not: excludeId };
        }

        const course = await this.prisma.course.findFirst({ where });
        return !!course;
    }

    /**
     * Find courses by type (vod or live)
     */
    async findByType(type: 'vod' | 'live'): Promise<Course[]> {
        return this.prisma.course.findMany({
            where: {
                type,
                deletedAt: null,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Find featured courses
     * Note: Featured functionality removed. This method is kept for backward compatibility.
     * TODO: Remove or implement via aiMetadata/tags filtering
     */
    async findFeatured(): Promise<Course[]> {
        // Featured courses removed - return empty array
        return [];
    }

    /**
     * Update course statistics
     */
    async updateStats(courseId: string, stats: {
        totalStudents?: number;
        totalLessons?: number;
        totalQuizzes?: number;
        averageRating?: number;
        totalReviews?: number;
    }): Promise<Course> {
        const updateData: Prisma.CourseUpdateInput = {
            updatedAt: new Date(),
        };

        if (stats.totalStudents !== undefined) updateData.totalStudents = stats.totalStudents;
        if (stats.totalLessons !== undefined) updateData.totalLessons = stats.totalLessons;
        if (stats.totalQuizzes !== undefined) updateData.totalQuizzes = stats.totalQuizzes;
        if (stats.averageRating !== undefined) updateData.averageRating = stats.averageRating;
        if (stats.totalReviews !== undefined) updateData.totalReviews = stats.totalReviews;

        return this.prisma.course.update({
            where: { id: courseId },
            data: updateData,
        });
    }
}
