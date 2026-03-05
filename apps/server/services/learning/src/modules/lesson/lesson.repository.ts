import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { Lesson, Prisma } from '@prisma/generated';
import type { ILessonRepository } from '@server/learning/interfaces/repositories';

/**
 * Lesson Repository
 * Handles all database operations for Lesson entity.
 * Note: Ordering of lessons within a module is managed by ModuleItem, not here.
 */
@Injectable()
export class LessonRepository implements ILessonRepository {
    private readonly logger = new Logger(LessonRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Find lesson by ID
     */
    async findById(lessonId: string): Promise<Lesson | null> {
        return this.prisma.lesson.findUnique({
            where: { id: lessonId },
        });
    }

    /**
     * Find all lessons for a module
     */
    async findByModuleId(moduleId: string, includeDrafts: boolean = false): Promise<Lesson[]> {
        return this.prisma.lesson.findMany({
            where: {
                moduleId,
                deletedAt: null,
                ...(includeDrafts ? {} : { status: 'published' }),
            },
            orderBy: { createdAt: 'asc' },
        });
    }

    /**
     * Find all lessons with pagination and filtering
     */
    async findMany(options: {
        skip: number;
        take: number;
        where?: Prisma.LessonWhereInput;
        orderBy?: Prisma.LessonOrderByWithRelationInput;
        include?: Prisma.LessonInclude;
    }): Promise<Lesson[]> {
        return this.prisma.lesson.findMany({
            where: options.where,
            skip: Number(options.skip) || 0,
            take: Number(options.take) || 10,
            orderBy: options.orderBy || { createdAt: 'asc' },
            include: options.include,
        });
    }

    /**
     * Count lessons with optional filter
     */
    async count(where?: Prisma.LessonWhereInput): Promise<number> {
        return this.prisma.lesson.count({ where });
    }

    /**
     * Create new lesson
     */
    async create(data: Prisma.LessonCreateInput): Promise<Lesson> {
        return this.prisma.lesson.create({ data });
    }

    /**
     * Update lesson by ID
     */
    async update(lessonId: string, data: Prisma.LessonUpdateInput): Promise<Lesson> {
        return this.prisma.lesson.update({
            where: { id: lessonId },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });
    }

    /**
     * Delete lesson (hard delete)
     */
    async delete(lessonId: string): Promise<void> {
        await this.prisma.lesson.delete({
            where: { id: lessonId },
        });
    }

    /**
     * Soft delete lesson
     */
    async softDelete(lessonId: string): Promise<Lesson> {
        return this.prisma.lesson.update({
            where: { id: lessonId },
            data: {
                deletedAt: new Date(),
                updatedAt: new Date(),
            },
        });
    }

    /**
     * Find preview lessons for a course (through modules)
     */
    async findPreviewLessonsByCourseId(courseMasterId: string): Promise<Lesson[]> {
        return this.prisma.lesson.findMany({
            where: {
                module: {
                    courseMasterId,
                },
                isPreview: true,
                status: 'published',
                deletedAt: null,
            },
            include: {
                module: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
            orderBy: { createdAt: 'asc' },
        });
    }

    /**
     * Find top N lessons for a course (ordered by module createdAt then lesson createdAt)
     */
    async findTopLessonsByCourse(courseMasterId: string, limit: number): Promise<Lesson[]> {
        return this.prisma.lesson.findMany({
            where: {
                module: {
                    courseMasterId,
                    deletedAt: null,
                    status: 'published',
                },
                deletedAt: null,
                status: 'published',
            },
            take: limit,
            orderBy: [
                { module: { createdAt: 'asc' } },
                { createdAt: 'asc' },
            ],
        });
    }
}
