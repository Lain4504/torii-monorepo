import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { LessonMaterial, Prisma } from '@prisma/generated';
import type { ILessonMaterialRepository } from '@server/learning/interfaces/repositories';

/**
 * Lesson Material Repository
 * Handles all database operations for LessonMaterial entity
 */
@Injectable()
export class LessonMaterialRepository implements ILessonMaterialRepository {
    private readonly logger = new Logger(LessonMaterialRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Find lesson material by ID
     */
    async findById(id: string): Promise<LessonMaterial | null> {
        return this.prisma.lessonMaterial.findUnique({
            where: { id },
            include: {
                fileAsset: {
                    select: {
                        id: true,
                        fileUrl: true,
                        mimeType: true,
                        fileSize: true,
                        status: true,
                    },
                },
                lesson: {
                    select: {
                        id: true,
                        title: true,
                        moduleId: true,
                    },
                },
            },
        });
    }

    /**
     * Find all materials for a lesson
     */
    async findByLessonId(lessonId: string): Promise<LessonMaterial[]> {
        return this.prisma.lessonMaterial.findMany({
            where: { lessonId },
            include: {
                fileAsset: {
                    select: {
                        id: true,
                        fileUrl: true,
                        mimeType: true,
                        fileSize: true,
                        status: true,
                    },
                },
            },
            orderBy: [
                { orderIndex: 'asc' },
                { createdAt: 'asc' },
            ],
        });
    }

    /**
     * Create new lesson material
     */
    async create(data: Prisma.LessonMaterialCreateInput): Promise<LessonMaterial> {
        return this.prisma.lessonMaterial.create({
            data,
            include: {
                fileAsset: {
                    select: {
                        id: true,
                        fileUrl: true,
                        mimeType: true,
                        fileSize: true,
                        status: true,
                    },
                },
            },
        });
    }

    /**
     * Update lesson material
     */
    async update(id: string, data: Prisma.LessonMaterialUpdateInput): Promise<LessonMaterial> {
        return this.prisma.lessonMaterial.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date(),
            },
            include: {
                fileAsset: {
                    select: {
                        id: true,
                        fileUrl: true,
                        mimeType: true,
                        fileSize: true,
                        status: true,
                    },
                },
            },
        });
    }

    /**
     * Delete lesson material
     */
    async delete(id: string): Promise<void> {
        await this.prisma.lessonMaterial.delete({
            where: { id },
        });
    }

    async checkLecturerAccess(lessonId: string, lecturerId: string): Promise<boolean> {
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                module: {
                    include: {
                        courseMaster: {
                            include: {
                                courseRuns: {
                                    select: {
                                        lecturerId: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        // Check if lesson exists and lecturer is teaching one of the course runs
        if (!lesson) return false;
        
        // Lecturer who teaches any run of this course master can edit materials
        return lesson.module.courseMaster.courseRuns.some(run => run.lecturerId === lecturerId);
    }

    /**
     * Find material by lesson and file asset (for duplicate check)
     */
    async findByLessonAndFile(lessonId: string, fileAssetId: string): Promise<LessonMaterial | null> {
        return this.prisma.lessonMaterial.findFirst({
            where: {
                lessonId,
                fileAssetId,
            },
        });
    }
}

