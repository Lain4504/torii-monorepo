import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { CourseMaster, CourseVersion, Prisma } from '@prisma/generated';
import type { ICourseMasterRepository } from '@server/learning/interfaces/repositories';

/**
 * Course Repository
 * Handles all database operations for Course entity
 */
@Injectable()
export class CourseMasterRepository implements ICourseMasterRepository {
    private readonly logger = new Logger(CourseMasterRepository.name);

    constructor(private readonly prisma: PrismaService) { }

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
    async update(courseMasterId: string, data: Prisma.CourseMasterUpdateInput): Promise<CourseMaster> {
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
     * Update course master statistics
     */
    async updateStats(courseMasterId: string, stats: {
        totalLessons?: number;
        totalQuizzes?: number;
    }): Promise<CourseMaster> {
        const updateData: Prisma.CourseMasterUpdateInput = {
            updatedAt: new Date(),
        };

        if (stats.totalLessons !== undefined) updateData.totalLessons = stats.totalLessons;
        if (stats.totalQuizzes !== undefined) updateData.totalQuizzes = stats.totalQuizzes;

        return this.prisma.courseMaster.update({
            where: { id: courseMasterId },
            data: updateData,
        });
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
    async createVersion(data: Prisma.CourseVersionCreateInput): Promise<CourseVersion> {
        return this.prisma.courseVersion.create({ data });
    }

    /**
     * Get the latest published version for a course master
     */
    async getLatestVersion(courseMasterId: string): Promise<CourseVersion | null> {
        return this.prisma.courseVersion.findFirst({
            where: { courseMasterId },
            orderBy: { publishedAt: 'desc' },
        });
    }

    /**
     * Count published quizzes for a course master
     */
    async countQuizzes(courseMasterId: string): Promise<number> {
        return this.prisma.quiz.count({
            where: {
                OR: [
                    { id: courseMasterId },
                    { lesson: { module: { id: courseMasterId } } }
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
     * Count published lessons for a course master
     */
    async countLessons(courseMasterId: string): Promise<number> {
        return this.prisma.lesson.count({
            where: {
                module: {
                    courseMasterId,
                    status: 'published',
                    deletedAt: null,
                },
                status: 'published',
                deletedAt: null,
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
}
