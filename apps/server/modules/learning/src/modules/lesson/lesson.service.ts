import { Injectable, Logger, Inject, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import type { Lesson } from '@prisma/generated';

import type {
  LessonCreateDTO,
  LessonUpdateDTO,
  LessonResponseDTO,
  PaginationOptionsDTO,
  PaginatedResponseDTO,
  Requester,
} from '@workspace/schemas';

import type { ILessonService } from '../../interfaces/services';
import type { ILessonRepository } from '../../interfaces/repositories';
import { LESSON_REPOSITORY_TOKEN } from '../../interfaces/repositories';

/**
 * Lesson Service
 * Handles lesson business logic operations
 */
@Injectable()
export class LessonService implements ILessonService {
  private readonly logger = new Logger(LessonService.name);

  constructor(
    @Inject(LESSON_REPOSITORY_TOKEN)
    private readonly lessonRepository: ILessonRepository,
  ) { }

  /**
   * Map Lesson entity to LessonResponseDTO
   */
  private toLessonResponseDTO(lesson: Lesson): LessonResponseDTO {
    return {
      id: lesson.id,
      moduleId: lesson.moduleId,
      title: lesson.title,
      contentType: lesson.contentType as any,
      videoUrl: lesson.videoUrl || undefined,
      videoDuration: lesson.videoDuration || undefined,
      articleContent: lesson.articleContent || undefined,
      aiMetadata: lesson.aiMetadata || undefined,
      orderIndex: lesson.orderIndex,
      isPreview: lesson.isPreview,
      isUnlocked: lesson.isUnlocked,
      createdBy: lesson.createdBy || undefined,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
      deletedAt: lesson.deletedAt || undefined,
    };
  }

  /**
   * Find all lessons with pagination and search
   */
  async findAll(options: PaginationOptionsDTO): Promise<PaginatedResponseDTO<LessonResponseDTO>> {
    try {
      const { page = 1, limit = 10, search } = options;
      const skip = (page - 1) * limit;

      const where: any = {
        deletedAt: null,
      };

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { articleContent: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [total, lessons] = await Promise.all([
        this.lessonRepository.count(where),
        this.lessonRepository.findMany({
          skip,
          take: limit,
          where,
          orderBy: { orderIndex: 'asc' },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: lessons.map(lesson => this.toLessonResponseDTO(lesson)),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error: any) {
      this.logger.error('Failed to retrieve lessons', error);
      throw new BadRequestException('Failed to retrieve lessons');
    }
  }

  /**
   * Find one lesson by ID
   */
  async findOne(lessonId: string): Promise<LessonResponseDTO> {
    const lesson = await this.lessonRepository.findById(lessonId);

    if (!lesson || lesson.deletedAt) {
      throw new NotFoundException(`Lesson with id ${lessonId} not found`);
    }

    return this.toLessonResponseDTO(lesson);
  }

  /**
   * Find all lessons for a specific module
   */
  async findByModuleId(moduleId: string): Promise<LessonResponseDTO[]> {
    const lessons = await this.lessonRepository.findByModuleId(moduleId);
    return lessons.map(lesson => this.toLessonResponseDTO(lesson));
  }

  /**
   * Find preview lessons for a course
   */
  async findPreviewLessonsByCourseId(courseId: string): Promise<LessonResponseDTO[]> {
    const lessons = await this.lessonRepository.findPreviewLessonsByCourseId(courseId);
    return lessons.map(lesson => this.toLessonResponseDTO(lesson));
  }

  /**
   * Create a new lesson
   */
  async create(requester: Requester, dto: LessonCreateDTO): Promise<LessonResponseDTO> {
    // Check permissions
    if (!['ADMIN', 'LECTURER'].includes(requester.role)) {
      throw new ForbiddenException('Only admins and lecturers can create lessons');
    }

    try {
      // Get next order index if not provided
      let orderIndex = dto.orderIndex;
      if (orderIndex === undefined) {
        const maxOrder = await this.lessonRepository.getMaxOrderIndex(dto.moduleId);
        orderIndex = maxOrder + 1;
      }

      const data: any = {
        module: { connect: { id: dto.moduleId } },
        title: dto.title,
        contentType: dto.contentType,
        videoUrl: dto.videoUrl || null,
        videoDuration: dto.videoDuration || null,
        articleContent: dto.articleContent || null,
        aiMetadata: dto.aiMetadata || {},
        orderIndex,
        isPreview: dto.isPreview ?? false,
        isUnlocked: dto.isUnlocked ?? true,
        createdBy: requester.userId,
      };

      const lesson = await this.lessonRepository.create(data);
      return this.toLessonResponseDTO(lesson);
    } catch (error: any) {
      this.logger.error('Error creating lesson', error);
      throw new BadRequestException(`Failed to create lesson: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Update lesson
   */
  async update(requester: Requester, lessonId: string, dto: LessonUpdateDTO): Promise<LessonResponseDTO> {
    // Check permissions
    if (!['ADMIN', 'LECTURER'].includes(requester.role)) {
      throw new ForbiddenException('Only admins and lecturers can update lessons');
    }

    const existing = await this.lessonRepository.findById(lessonId);

    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Lesson with id ${lessonId} not found`);
    }

    try {
      const updateData: any = {};

      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.contentType !== undefined) updateData.contentType = dto.contentType;
      if (dto.videoUrl !== undefined) updateData.videoUrl = dto.videoUrl;
      if (dto.videoDuration !== undefined) updateData.videoDuration = dto.videoDuration;
      if (dto.articleContent !== undefined) updateData.articleContent = dto.articleContent;
      if (dto.aiMetadata !== undefined) updateData.aiMetadata = dto.aiMetadata;
      if (dto.orderIndex !== undefined) updateData.orderIndex = dto.orderIndex;
      if (dto.isPreview !== undefined) updateData.isPreview = dto.isPreview;
      if (dto.isUnlocked !== undefined) updateData.isUnlocked = dto.isUnlocked;

      if (Object.keys(updateData).length === 0) {
        return this.toLessonResponseDTO(existing);
      }

      const lesson = await this.lessonRepository.update(lessonId, updateData);
      return this.toLessonResponseDTO(lesson);
    } catch (error: any) {
      this.logger.error('Error updating lesson', error);
      throw new BadRequestException(`Failed to update lesson: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Delete lesson
   */
  async delete(requester: Requester, lessonId: string, hardDelete = false): Promise<{ message: string }> {
    if (requester.role !== 'ADMIN') {
      throw new ForbiddenException('Only admins can delete lessons');
    }

    const existing = await this.lessonRepository.findById(lessonId);

    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Lesson with id ${lessonId} not found`);
    }

    try {
      if (hardDelete) {
        await this.lessonRepository.delete(lessonId);
      } else {
        await this.lessonRepository.softDelete(lessonId);
      }

      return { message: 'Lesson deleted successfully' };
    } catch (error: any) {
      throw new BadRequestException(`Failed to delete lesson: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Reorder lessons within a module
   */
  async reorder(
    requester: Requester,
    moduleId: string,
    lessonOrders: { id: string; orderIndex: number }[]
  ): Promise<{ message: string }> {
    if (!['ADMIN', 'LECTURER'].includes(requester.role)) {
      throw new ForbiddenException('Only admins and lecturers can reorder lessons');
    }

    try {
      await this.lessonRepository.reorder(moduleId, lessonOrders);
      return { message: 'Lessons reordered successfully' };
    } catch (error: any) {
      this.logger.error('Error reordering lessons', error);
      throw new BadRequestException(`Failed to reorder lessons: ${error?.message || 'Unknown error'}`);
    }
  }
}
