import { Injectable, Logger, Inject, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '@server/shared';
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
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
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
        fileId: string,
    ): Promise<LessonMaterialResponseDTO> {
        try {
            // Verify lesson exists
            const lesson = await this.prisma.lesson.findUnique({
                where: { id: dto.lessonId },
            });

            if (!lesson || lesson.deletedAt) {
                throw new NotFoundException(`Lesson with id ${dto.lessonId} not found`);
            }

            // Check access permissions
            await this.checkAccess(dto.lessonId, requester);

            // Verify file asset exists in Storage Microservice via NATS
            const fileAsset = await firstValueFrom(
                this.natsClient.send({ cmd: 'storage.findById' }, { fileId })
            );

            if (!fileAsset || fileAsset.status !== 'uploaded') {
                throw new BadRequestException('File not found or upload not confirmed');
            }

            // Create LessonMaterial record
            const material = await this.lessonMaterialRepository.create({
                lesson: { connect: { id: dto.lessonId } },
                fileAsset: { connect: { id: fileAsset.id } },
                type: dto.type,
                title: dto.title || fileAsset.metadata?.originalName || 'Untitled Material',
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
            // Delete lesson material record
            await this.lessonMaterialRepository.delete(materialId);

            // Trigger file deletion in Storage Microservice via NATS
            await firstValueFrom(
                this.natsClient.send({ cmd: 'storage.deleteFile' }, { fileId: existing.fileAssetId })
            );

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
