import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { Enrollment, Prisma } from '@prisma/generated';
import type { IEnrollmentRepository } from '@server/learning/interfaces/repositories';

/**
 * Enrollment Repository
 * Handles all database operations for Enrollment entity
 */
@Injectable()
export class EnrollmentRepository implements IEnrollmentRepository {
    private readonly logger = new Logger(EnrollmentRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Find enrollment by ID
     */
    async findById(id: string): Promise<Enrollment | null> {
        return this.prisma.enrollment.findUnique({
            where: { id },
        });
    }

    /**
     * Find enrollment by user and course run
     */
    async findByUserAndCourseRun(userId: string, courseRunId: string): Promise<Enrollment | null> {
        return this.prisma.enrollment.findUnique({
            where: {
                userId_courseRunId: {
                    userId,
                    courseRunId,
                },
            },
        });
    }

    /**
     * Find any active enrollment by user and course master
     * Useful when courseRunId is unknown but we have courseMasterId
     */
    async findByUserAndCourseMaster(userId: string, courseMasterId: string): Promise<Enrollment | null> {
        return this.prisma.enrollment.findFirst({
            where: {
                userId,
                courseRun: {
                    courseMasterId,
                },
                completionStatus: {
                    in: ['ACTIVE', 'IN_PROGRESS'] as any,
                },
            },
            orderBy: { enrollmentDate: 'desc' },
        });
    }

    /**
     * Find all enrollments by user and course master
     */
    async findAllByUserAndCourseMaster(userId: string, courseMasterId: string): Promise<Enrollment[]> {
        return this.prisma.enrollment.findMany({
            where: {
                userId,
                courseRun: {
                    courseMasterId,
                },
            },
            orderBy: { enrollmentDate: 'desc' },
        });
    }

    /**
     * Find all enrollments with pagination and filters
     */
    async findMany(options: {
        skip: number;
        take: number;
        where?: Prisma.EnrollmentWhereInput;
        orderBy?: Prisma.EnrollmentOrderByWithRelationInput;
        include?: Prisma.EnrollmentInclude;
    }): Promise<Enrollment[]> {
        return this.prisma.enrollment.findMany({
            where: options.where,
            skip: options.skip,
            take: options.take,
            orderBy: options.orderBy || { enrollmentDate: 'desc' },
            include: options.include,
        });
    }

    /**
     * Count enrollments with optional filter
     */
    async count(where?: Prisma.EnrollmentWhereInput): Promise<number> {
        return this.prisma.enrollment.count({
            where,
        });
    }

    /**
     * Create a new enrollment
     */
    async create(data: Prisma.EnrollmentCreateInput): Promise<Enrollment> {
        return this.prisma.enrollment.create({
            data,
        });
    }

    /**
     * Update enrollment
     */
    async update(id: string, data: Prisma.EnrollmentUpdateInput): Promise<Enrollment> {
        return this.prisma.enrollment.update({
            where: { id },
            data,
        });
    }

    /**
     * Delete enrollment by ID
     */
    async delete(id: string): Promise<void> {
        await this.prisma.enrollment.delete({
            where: { id },
        });
    }

    /**
     * Count total learning seconds for a user across all enrollments
     * based on completed lessons
     */
    async countTotalLearningSeconds(userId: string): Promise<number> {
        const result = await this.prisma.lessonProgress.aggregate({
            where: {
                enrollment: {
                    userId,
                },
            },
            _sum: {
                watchedDuration: true,
            },
        });

        return result._sum.watchedDuration || 0;
    }
}


