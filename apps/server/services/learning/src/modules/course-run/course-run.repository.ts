import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { CourseRun, CourseRunReview, Prisma } from '@prisma/generated';
import type { ICourseRunRepository } from '../../interfaces/repositories/i-course-run.repository';

@Injectable()
export class CourseRunRepository implements ICourseRunRepository {
    private readonly logger = new Logger(CourseRunRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string): Promise<CourseRun | null> {
        return this.prisma.courseRun.findUnique({
            where: { id },
            include: {
                lecturer: true,
                courseMaster: true,
            },
        });
    }

    async findBySlug(slug: string): Promise<CourseRun | null> {
        return this.prisma.courseRun.findUnique({
            where: { slug },
            include: {
                lecturer: true,
                courseMaster: true,
            },
        });
    }

    async findMany(options: {
        skip: number;
        take: number;
        where?: Prisma.CourseRunWhereInput;
        orderBy?: Prisma.CourseRunOrderByWithRelationInput;
        include?: Prisma.CourseRunInclude;
    }): Promise<CourseRun[]> {
        return this.prisma.courseRun.findMany({
            where: options.where,
            skip: options.skip,
            take: options.take,
            orderBy: options.orderBy || { startDate: 'asc' },
            include: options.include,
        });
    }

    async count(where?: Prisma.CourseRunWhereInput): Promise<number> {
        return this.prisma.courseRun.count({ where });
    }

    async create(data: Prisma.CourseRunCreateInput): Promise<CourseRun> {
        return this.prisma.courseRun.create({ data });
    }

    async update(id: string, data: Prisma.CourseRunUpdateInput): Promise<CourseRun> {
        return this.prisma.courseRun.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.courseRun.delete({
            where: { id },
        });
    }

    async slugExists(slug: string, excludeId?: string): Promise<boolean> {
        const where: Prisma.CourseRunWhereInput = { slug };
        if (excludeId) {
            where.id = { not: excludeId };
        }
        const run = await this.prisma.courseRun.findFirst({ where });
        return !!run;
    }

    async findExpiredEnrollmentCourseRuns(): Promise<CourseRun[]> {
        return this.prisma.courseRun.findMany({
            where: {
                status: 'ENROLLING',
                enrollmentEnd: {
                    lt: new Date(),
                },
            },
        });
    }

    async createRunReview(data: Prisma.CourseRunReviewCreateInput): Promise<CourseRunReview> {
        return this.prisma.courseRunReview.create({ data });
    }

    async updateRunReview(id: string, data: Prisma.CourseRunReviewUpdateInput): Promise<CourseRunReview> {
        return this.prisma.courseRunReview.update({
            where: { id },
            data,
        });
    }

    async findRunReviews(where: Prisma.CourseRunReviewWhereInput, orderBy?: Prisma.CourseRunReviewOrderByWithRelationInput): Promise<CourseRunReview[]> {
        return this.prisma.courseRunReview.findMany({
            where,
            orderBy,
        });
    }

}
