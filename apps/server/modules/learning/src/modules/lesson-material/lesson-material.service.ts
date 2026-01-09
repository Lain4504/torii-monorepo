import { Injectable, Logger, Inject, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService, SharedStorageService } from '@server/shared';
import type { LessonMaterial } from '@prisma/generated';
import { v4 as uuidv4 } from 'uuid';

import type {
    LessonMaterialResponseDTO,
    LessonMaterialCreateDTO,
    LessonMaterialUpdateDTO,
    Requester,
} from '@workspace/schemas';
import { ALLOWED_MIME_TYPES, isAllowedMimeType, getErrorMessage, UserRole } from '@workspace/schemas';

import type { ILessonMaterialService } from '../../interfaces/services';
import type { ILessonMaterialRepository } from '../../interfaces/repositories';
import { LESSON_MATERIAL_REPOSITORY_TOKEN } from '../../interfaces/repositories';

/**
 * Lesson Material Service
 * Handles lesson material (file upload) business logic
 */
@Injectable()
export class LessonMaterialService implements ILessonMaterialService {
    private readonly logger = new Logger(LessonMaterialService.name);

    constructor(
        @Inject(LESSON_MATERIAL_REPOSITORY_TOKEN)
        private readonly lessonMaterialRepository: ILessonMaterialRepository,
        private readonly prisma: PrismaService,
        private readonly storageService: SharedStorageService,
    ) { }

    /**
     * Map LessonMaterial entity to LessonMaterialResponseDTO
     */
    private toLessonMaterialResponseDTO(material: any): LessonMaterialResponseDTO {
        return {
            id: material.id,
            lessonId: material.lessonId,
            fileAssetId: material.fileAssetId,
            type: material.type,
            title: material.title || null,
            orderIndex: material.orderIndex,
            createdBy: material.createdBy,
            createdAt: material.createdAt,
            updatedAt: material.updatedAt,
            fileAsset: {
                id: material.fileAsset.id,
                fileUrl: material.fileAsset.fileUrl,
                mimeType: material.fileAsset.mimeType,
                fileSize: material.fileAsset.fileSize,
                status: material.fileAsset.status,
            },
        };
    }

    /**
     * Generate unique file key for R2 storage
     */
    private generateFileKey(lessonId: string, fileName: string): string {
        const timestamp = Date.now();
        const uuid = uuidv4();
        const extension = fileName.split('.').pop();
        return `lesson-materials/${lessonId}/${timestamp}-${uuid}.${extension}`;
    }

    /**
     * Check if requester has access to lesson materials
     */
    private async checkAccess(lessonId: string, requester: Requester): Promise<void> {
        // Admin and Staff have full access
        if (['ADMIN', 'STAFF'].includes(requester.role)) {
            return;
        }

        // Lecturers need to be assigned to the course
        if (requester.role === UserRole.LECTURER) {
            const hasAccess = await this.lessonMaterialRepository.checkLecturerAccess(
                lessonId,
                requester.sub
            );

            if (!hasAccess) {
                throw new ForbiddenException('You are not assigned to this course');
            }
            return;
        }

        // Other roles (learner) cannot upload materials
        throw new ForbiddenException('Only staff and lecturers can manage lesson materials');
    }

    /**
     * Upload and create a new lesson material
     */
    async uploadMaterial(
        requester: Requester,
        dto: LessonMaterialCreateDTO,
        file: Buffer,
        fileName: string,
        mimeType: string
    ): Promise<LessonMaterialResponseDTO> {
        try {
            // Validate MIME type
            if (!isAllowedMimeType(mimeType)) {
                throw new BadRequestException(getErrorMessage());
            }

            // Verify lesson exists
            const lesson = await this.prisma.lesson.findUnique({
                where: { id: dto.lessonId },
            });

            if (!lesson || lesson.deletedAt) {
                throw new NotFoundException(`Lesson with id ${dto.lessonId} not found`);
            }

            // Check access permissions
            await this.checkAccess(dto.lessonId, requester);

            // Generate file key and upload to R2
            const fileKey = this.generateFileKey(dto.lessonId, fileName);
            const fileUrl = await this.storageService.upload({
                key: fileKey,
                file,
                contentType: mimeType,
                metadata: {
                    lessonId: dto.lessonId,
                    materialType: dto.type,
                    uploadedBy: requester.sub,
                },
            });

            // Create FileAsset record
            const fileAsset = await this.prisma.fileAsset.create({
                data: {
                    fileUrl,
                    mimeType,
                    fileSize: BigInt(file.length),
                    isPublic: false,
                    status: 'uploaded',
                    metadata: {
                        originalName: fileName,
                        materialType: dto.type,
                    },
                    ownerId: requester.sub,
                    moduleOrigin: 'COURSE',
                },
            });

            // Create LessonMaterial record
            const material = await this.lessonMaterialRepository.create({
                lesson: { connect: { id: dto.lessonId } },
                fileAsset: { connect: { id: fileAsset.id } },
                type: dto.type,
                title: dto.title || fileName,
                orderIndex: 0, // Will be updated if reordering is implemented
                createdBy: requester.sub,
            });

            this.logger.log(`Material uploaded for lesson ${dto.lessonId} by user ${requester.sub}`);

            return this.toLessonMaterialResponseDTO(material);
        } catch (error: any) {
            if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ForbiddenException) {
                throw error;
            }
            this.logger.error('Error uploading lesson material', error);
            throw new BadRequestException(`Failed to upload material: ${error?.message || 'Unknown error'}`);
        }
    }

    /**
     * Get all materials for a lesson
     */
    async findByLessonId(lessonId: string): Promise<LessonMaterialResponseDTO[]> {
        // Verify lesson exists
        const lesson = await this.prisma.lesson.findUnique({
            where: { id: lessonId },
        });

        if (!lesson || lesson.deletedAt) {
            throw new NotFoundException(`Lesson with id ${lessonId} not found`);
        }

        const materials = await this.lessonMaterialRepository.findByLessonId(lessonId);
        return materials.map(material => this.toLessonMaterialResponseDTO(material));
    }

    /**
     * Update lesson material metadata
     */
    async updateMaterial(
        requester: Requester,
        materialId: string,
        dto: LessonMaterialUpdateDTO
    ): Promise<LessonMaterialResponseDTO> {
        const existing = await this.lessonMaterialRepository.findById(materialId);

        if (!existing) {
            throw new NotFoundException(`Material with id ${materialId} not found`);
        }

        // Check access permissions
        await this.checkAccess(existing.lessonId, requester);

        try {
            const updateData: any = {};

            if (dto.title !== undefined) updateData.title = dto.title;
            if (dto.orderIndex !== undefined) updateData.orderIndex = dto.orderIndex;
            if (dto.type !== undefined) updateData.type = dto.type;

            if (Object.keys(updateData).length === 0) {
                return this.toLessonMaterialResponseDTO(existing);
            }

            const updated = await this.lessonMaterialRepository.update(materialId, updateData);
            return this.toLessonMaterialResponseDTO(updated);
        } catch (error: any) {
            this.logger.error('Error updating lesson material', error);
            throw new BadRequestException(`Failed to update material: ${error?.message || 'Unknown error'}`);
        }
    }

    /**
     * Delete lesson material
     */
    async deleteMaterial(
        requester: Requester,
        materialId: string
    ): Promise<{ message: string }> {
        const existing = await this.lessonMaterialRepository.findById(materialId);

        if (!existing) {
            throw new NotFoundException(`Material with id ${materialId} not found`);
        }

        // Check access permissions
        await this.checkAccess(existing.lessonId, requester);

        try {
            // Get file asset to delete from R2
            const fileAsset = await this.prisma.fileAsset.findUnique({
                where: { id: existing.fileAssetId },
            });

            // Delete lesson material record
            await this.lessonMaterialRepository.delete(materialId);

            // Delete file from R2 if file asset exists
            if (fileAsset) {
                try {
                    const fileKey = this.storageService.extractKeyFromUrl(fileAsset.fileUrl);
                    await this.storageService.delete(fileKey);

                    // Delete file asset record
                    await this.prisma.fileAsset.delete({
                        where: { id: fileAsset.id },
                    });
                } catch (error: any) {
                    this.logger.error(`Failed to delete file from R2: ${error?.message}`, error);
                    // Continue even if file deletion fails
                }
            }

            this.logger.log(`Material ${materialId} deleted by user ${requester.sub}`);
            return { message: 'Material deleted successfully' };
        } catch (error: any) {
            if (error instanceof NotFoundException || error instanceof ForbiddenException) {
                throw error;
            }
            this.logger.error('Error deleting lesson material', error);
            throw new BadRequestException(`Failed to delete material: ${error?.message || 'Unknown error'}`);
        }
    }
}
