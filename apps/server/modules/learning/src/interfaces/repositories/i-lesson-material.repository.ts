import type { LessonMaterial, Prisma } from '@prisma/generated';

/**
 * Lesson Material Repository Interface
 * Defines the contract for Lesson Material data access operations
 */
export interface ILessonMaterialRepository {
    /**
     * Find lesson material by ID
     */
    findById(id: string): Promise<LessonMaterial | null>;

    /**
     * Find all materials for a lesson
     */
    findByLessonId(lessonId: string): Promise<LessonMaterial[]>;

    /**
     * Create new lesson material
     */
    create(data: Prisma.LessonMaterialCreateInput): Promise<LessonMaterial>;

    /**
     * Update lesson material
     */
    update(id: string, data: Prisma.LessonMaterialUpdateInput): Promise<LessonMaterial>;

    /**
     * Delete lesson material
     */
    delete(id: string): Promise<void>;

    /**
     * Check if lecturer has access to a lesson's materials
     * (via course_instructors table join)
     */
    checkLecturerAccess(lessonId: string, lecturerId: string): Promise<boolean>;

    /**
     * Find material by lesson and file asset (for duplicate check)
     */
    findByLessonAndFile(lessonId: string, fileAssetId: string): Promise<LessonMaterial | null>;
}
