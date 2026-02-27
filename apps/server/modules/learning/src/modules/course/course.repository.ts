import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { Course, CourseVersion, Prisma } from '@prisma/generated';
import type { ICourseRepository } from '@server/learning/interfaces/repositories';

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
     */
    async findFeatured(): Promise<Course[]> {
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

    /**
     * Get lecturer for a course
     */
    async getLecturer(courseId: string): Promise<any | null> {
        const course = await this.prisma.course.findUnique({
            where: { id: courseId },
            select: {
                lecturerId: true,
            },
        });

        if (!course?.lecturerId) {
            return null;
        }

        const lecturer = await this.prisma.user.findUnique({
            where: { id: course.lecturerId },
            select: {
                id: true,
                displayName: true,
                avatarUrl: true,
                email: true,
            },
        });

        return lecturer;
    }

    /**
     * Create a new course version snapshot
     */
    async createVersion(data: Prisma.CourseVersionCreateInput): Promise<CourseVersion> {
        return this.prisma.courseVersion.create({ data });
    }

    /**
     * Get the latest published version for a course
     */
    async getLatestVersion(courseId: string): Promise<CourseVersion | null> {
        return this.prisma.courseVersion.findFirst({
            where: { courseId },
            orderBy: { publishedAt: 'desc' },
        });
    }

    /**
     * Count published quizzes for a course
     */
    async countQuizzes(courseId: string): Promise<number> {
        return this.prisma.quiz.count({
            where: {
                OR: [
                    { courseId },
                    { lesson: { module: { courseId } } }
                ],
                status: 'published',
            },
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
     * Count published lessons for a course
     */
    async countLessons(courseId: string): Promise<number> {
        return this.prisma.lesson.count({
            where: {
                module: {
                    courseId,
                    status: 'published',
                    deletedAt: null,
                },
                status: 'published',
                deletedAt: null,
            },
        });
    }

    /**
     * Increment total students for a course
     */
    async incrementTotalStudents(courseId: string): Promise<void> {
        await this.prisma.course.update({
            where: { id: courseId },
            data: {
                totalStudents: {
                    increment: 1,
                },
            },
        });
    }
}
