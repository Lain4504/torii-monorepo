import { Injectable, Logger, Inject, NotFoundException, BadRequestException, ForbiddenException, forwardRef } from '@nestjs/common';
import type { Lesson } from '@prisma/generated';

import { UserRole } from '@workspace/schemas';
import type {
  LessonCreateDTO,
  LessonUpdateDTO,
  LessonResponseDTO,
  PaginationOptionsDTO,
  PaginatedResponseDTO,
  Requester,
} from '@workspace/schemas';

import type { ILessonService, ICourseService, IEnrollmentService } from '../../interfaces/services';
import type { ILessonRepository, IModuleRepository } from '../../interfaces/repositories';
import { LESSON_REPOSITORY_TOKEN, MODULE_REPOSITORY_TOKEN } from '../../interfaces/repositories';
import { COURSE_SERVICE_TOKEN, ENROLLMENT_SERVICE_TOKEN } from '../../interfaces/services';

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
    @Inject(MODULE_REPOSITORY_TOKEN)
    private readonly moduleRepository: IModuleRepository,
    @Inject(forwardRef(() => COURSE_SERVICE_TOKEN))
    private readonly courseService: ICourseService,
    @Inject(forwardRef(() => ENROLLMENT_SERVICE_TOKEN))
    private readonly enrollmentService: IEnrollmentService,
  ) { }

  /**
   * Helper to trigger course stats update
   */
  private async triggerStatsUpdate(moduleId: string) {
    try {
      const module = await this.moduleRepository.findById(moduleId);
      if (module) {
        await this.courseService.recalculateStats(module.courseId);
      }
    } catch (error) {
      this.logger.error('Failed to trigger stats update from LessonService', error);
    }
  }

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
      aiMetadata: (lesson.aiMetadata as any) || undefined,
      orderIndex: lesson.orderIndex,
      isPreview: lesson.isPreview,
      isUnlocked: lesson.isUnlocked,
      status: (lesson as any).status || 'published',
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

      // Add filtering for status if needed, currently findAll used by Admin likely
      // If we want to strictly filter published for non-admins here, we'd need requester in findAll too
      // But keeping it flexible for now.

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { articleContent: { contains: search, mode: 'insensitive' } },
        ];
      }

      const queryParams = options as any;
      if (queryParams.moduleId) {
        where.moduleId = queryParams.moduleId;
      }

      if (queryParams.contentType) {
        where.contentType = queryParams.contentType;
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
  async findOne(lessonId: string, userId?: string): Promise<LessonResponseDTO> {
    const lesson = await this.lessonRepository.findById(lessonId);

    if (!lesson || lesson.deletedAt) {
      throw new NotFoundException(`Lesson with id ${lessonId} not found`);
    }

    const dto = this.toLessonResponseDTO(lesson);

    // Protection logic for video content
    if (dto.contentType === 'video' && dto.videoUrl && !dto.isPreview) {
      let isAuthorized = false;

      if (userId) {
        try {
          // Check if user is enrolled
          const module = await this.moduleRepository.findById(lesson.moduleId);
          if (module) {
            isAuthorized = await this.enrollmentService.isEnrolled(userId, module.courseId);
          }
        } catch (error) {
          this.logger.warn(`Failed to check enrollment for user ${userId} on lesson ${lessonId}`, error);
        }
      }

      // If not authorized, hide the video URL
      if (!isAuthorized) {
        dto.videoUrl = undefined;
      }
    }

    return dto;
  }

  /**
   * Find all lessons for a specific module
   */
  async findByModuleId(moduleId: string, requester?: Requester): Promise<LessonResponseDTO[]> {
    let includeDrafts = false;
    if (requester && [UserRole.ADMIN, UserRole.LECTURER].includes(requester.role as UserRole)) {
      includeDrafts = true;
    }

    // Explicitly pass boolean to repo method which accepts it as optional
    const lessons = await this.lessonRepository.findByModuleId(moduleId, includeDrafts);
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
    if (![UserRole.ADMIN, UserRole.LECTURER].includes(requester.role as UserRole)) {
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
        aiMetadata: (dto as any).aiMetadata || {},
        orderIndex,
        isPreview: dto.isPreview ?? false,
        isUnlocked: dto.isUnlocked ?? true,
        status: (dto as any).status || 'published',
        createdBy: requester.sub,
      };

      const lesson = await this.lessonRepository.create(data);

      // Update course stats
      await this.triggerStatsUpdate(dto.moduleId);

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
    if (![UserRole.ADMIN, UserRole.LECTURER].includes(requester.role as UserRole)) {
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
      if ((dto as any).aiMetadata !== undefined) updateData.aiMetadata = (dto as any).aiMetadata;
      if (dto.orderIndex !== undefined) updateData.orderIndex = dto.orderIndex;
      if (dto.isPreview !== undefined) updateData.isPreview = dto.isPreview;
      if (dto.isUnlocked !== undefined) updateData.isUnlocked = dto.isUnlocked;
      if ((dto as any).status !== undefined) updateData.status = (dto as any).status;

      if (Object.keys(updateData).length === 0) {
        return this.toLessonResponseDTO(existing);
      }

      const lesson = await this.lessonRepository.update(lessonId, updateData);

      // Update course stats if status changed
      if ((dto as any).status !== undefined && (dto as any).status !== (existing as any).status) {
        await this.triggerStatsUpdate(existing.moduleId);
      }

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
    if (requester.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can delete lessons');
    }

    const existing = await this.lessonRepository.findById(lessonId);

    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Lesson with id ${lessonId} not found`);
    }

    try {
      if (hardDelete) {
        await this.lessonRepository.delete(lessonId);
      }
      else {
        await this.lessonRepository.softDelete(lessonId);
      }

      // Update course stats
      await this.triggerStatsUpdate(existing.moduleId);

      return { message: 'Lesson deleted successfully' };
    }
    catch (error: any) {
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
    if (![UserRole.ADMIN, UserRole.LECTURER].includes(requester.role as UserRole)) {
      throw new ForbiddenException('Only admins and lecturers can reorder lessons');
    }

    try {
      await this.lessonRepository.reorder(moduleId, lessonOrders);
      return { message: 'Lessons reordered successfully' };
    }
    catch (error: any) {
      this.logger.error('Error reordering lessons', error);
      throw new BadRequestException(`Failed to reorder lessons: ${error?.message || 'Unknown error'}`);
    }
  }
}
