import { Injectable, Logger, Inject, NotFoundException, BadRequestException, ForbiddenException, forwardRef } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import type { Lesson } from '@prisma/generated';

import type {
  LessonCreateDTO,
  LessonUpdateDTO,
  LessonResponseDTO,
  PaginationOptionsDTO,
  PaginatedResponseDTO,
  Requester,
  LessonQueryDTO,
} from '@workspace/schemas';

import type { ILessonService, ICourseMasterService, IEnrollmentService } from '@server/learning/interfaces/services';
import type { ILessonRepository, IModuleRepository, IModuleItemRepository } from '@server/learning/interfaces/repositories';
import { LESSON_REPOSITORY_TOKEN, MODULE_REPOSITORY_TOKEN, MODULE_ITEM_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories';
import { COURSE_MASTER_SERVICE_TOKEN, ENROLLMENT_SERVICE_TOKEN } from '@server/learning/interfaces/services';

/**
 * Lesson Service
 * Handles lesson business logic operations.
 * Note: Ordering within a module is managed exclusively by ModuleItem.
 */
@Injectable()
export class LessonService implements ILessonService {
  private readonly logger = new Logger(LessonService.name);

  constructor(
    @Inject(LESSON_REPOSITORY_TOKEN)
    private readonly lessonRepository: ILessonRepository,
    @Inject(MODULE_REPOSITORY_TOKEN)
    private readonly moduleRepository: IModuleRepository,
    @Inject(forwardRef(() => COURSE_MASTER_SERVICE_TOKEN))
    private readonly courseMasterService: ICourseMasterService,
    @Inject(forwardRef(() => ENROLLMENT_SERVICE_TOKEN))
    private readonly enrollmentService: IEnrollmentService,
    @Inject(MODULE_ITEM_REPOSITORY_TOKEN)
    private readonly moduleItemRepository: IModuleItemRepository,
    @Inject('NATS_SERVICE')
    private readonly natsClient: ClientProxy,
    @InjectMapper() private readonly mapper: Mapper,
  ) { }

  /**
   * Helper to emit audit log event
   */
  private async createAuditLog(entry: {
    userId: string;
    action: string;
    entity: string;
    entityId?: string;
    description: string;
    metadata?: any;
    oldValues?: any;
    newValues?: any;
  }) {
    try {
      this.natsClient.emit({ cmd: 'identity.audit.log' }, entry);
    } catch (error) {
      this.logger.error(`Failed to emit audit log: ${error.message}`);
    }
  }

  /**
   * Helper to check if requester has a specific permission
   */
  private hasPermission(requester: Requester, permission: string): boolean {
    if (!requester.permissions) return false;
    return requester.permissions.includes('*') || requester.permissions.includes(permission);
  }

  /**
   * Helper to trigger course stats update
   */
  private async triggerStatsUpdate(moduleId: string) {
    try {
      const module = await this.moduleRepository.findById(moduleId);
      if (module) {
        this.natsClient.emit({ cmd: 'learning.courseMaster.recalculate_stats' }, { courseMasterId: module.courseMasterId });
      }
    } catch (error) {
      this.logger.error('Failed to trigger stats update from LessonService', error);
    }
  }

  /**
   * Map Lesson entity to LessonResponseDTO
   */
  private toLessonResponseDTO(lesson: Lesson): LessonResponseDTO {
    return this.mapper.map<Lesson, LessonResponseDTO>(lesson, 'Lesson', 'LessonResponseDTO');
  }

  /**
   * Build a protected DTO: mask sensitive content if the user is not authorized.
   */
  private buildProtectedDTO(lesson: Lesson, isAuthorized: boolean): LessonResponseDTO {
    const dto = this.toLessonResponseDTO(lesson);
    dto.isUnlocked = isAuthorized;
    if (!isAuthorized) {
      dto.videoUrl = undefined;
      dto.articleContent = undefined;
    }
    return dto;
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
          orderBy: { createdAt: 'asc' },
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
   * Search lessons with complex filters
   */
  async search(options: LessonQueryDTO): Promise<PaginatedResponseDTO<LessonResponseDTO>> {
    try {
      const { page = 1, limit = 10, search, moduleId, contentType, status } = options;
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

      if (moduleId) {
        where.moduleId = moduleId;
      }

      if (contentType) {
        where.contentType = contentType;
      }

      if (status) {
        where.status = status;
      }

      const [total, lessons] = await Promise.all([
        this.lessonRepository.count(where),
        this.lessonRepository.findMany({
          skip,
          take: limit,
          where,
          orderBy: { createdAt: 'asc' },
        }),
      ]);

      return {
        data: lessons.map(lesson => this.toLessonResponseDTO(lesson)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      this.logger.error('Failed to search lessons', error);
      throw new BadRequestException('Failed to search lessons');
    }
  }

  /**
   * Find one lesson by ID
   */
  async findById(lessonId: string, requester?: Requester): Promise<LessonResponseDTO> {
    const lesson = await this.lessonRepository.findById(lessonId);

    if (!lesson || lesson.deletedAt) {
      throw new NotFoundException(`Lesson with id ${lessonId} not found`);
    }

    const isStaff = requester && (
      this.hasPermission(requester, 'lesson.create') ||
      this.hasPermission(requester, 'lesson.update')
    );

    if (isStaff) {
      return this.toLessonResponseDTO(lesson);
    }

    let isAuthorized = false;

    if (lesson.isPreview) {
      isAuthorized = true;
    } else if (requester?.sub) {
      try {
        const module = await this.moduleRepository.findById(lesson.moduleId);
        if (module) {
          const hasAccess = await this.enrollmentService.isEnrolled(requester.sub, module.courseMasterId);
          if (hasAccess) {
            isAuthorized = true;
          }
        }
      } catch (error) {
        this.logger.warn(`Failed to check access for user ${requester.sub} on lesson ${lessonId}`, error);
      }
    }

    const isLessonAvailable = (lesson as any).status === 'published' || (lesson as any).status === undefined;
    isAuthorized = isAuthorized && isLessonAvailable;
    return this.buildProtectedDTO(lesson, isAuthorized);
  }

  /**
   * Find all lessons for a specific module.
   */
  async findByModuleId(moduleId: string, requester?: Requester): Promise<LessonResponseDTO[]> {
    const isStaff = requester && (
      this.hasPermission(requester, 'lesson.create') ||
      this.hasPermission(requester, 'lesson.update')
    );

    const lessons = await this.lessonRepository.findByModuleId(moduleId, !!isStaff);

    if (isStaff) {
      return lessons.map(lesson => this.toLessonResponseDTO(lesson));
    }

    let isEnrolled = false;

    if (requester?.sub) {
      try {
        const module = await this.moduleRepository.findById(moduleId);
        if (module) {
          isEnrolled = await this.enrollmentService.isEnrolled(requester.sub, module.courseMasterId);
        }
      } catch (error) {
        this.logger.warn(`Enrollment check failed for module ${moduleId}`, error);
      }
    }

    return lessons.map(lesson => {
      const isAuthorized = lesson.isPreview || isEnrolled;
      const isLessonAvailable = (lesson as any).status === 'published' || (lesson as any).status === undefined;
      return this.buildProtectedDTO(lesson, isAuthorized && isLessonAvailable);
    });
  }

  /**
   * Find preview lessons for a course
   */
  async findPreviewLessonsByCourseId(courseMasterId: string): Promise<LessonResponseDTO[]> {
    const lessons = await this.lessonRepository.findPreviewLessonsByCourseId(courseMasterId);
    return lessons.map(lesson => this.toLessonResponseDTO(lesson));
  }

  /**
   * Create a new lesson.
   * A corresponding ModuleItem is automatically created to register this lesson
   * into the module's ordered item list.
   */
  async create(requester: Requester, dto: LessonCreateDTO): Promise<LessonResponseDTO> {
    try {
      const module = await this.moduleRepository.findById(dto.moduleId);
      if (!module) throw new NotFoundException('Module not found');

      if (!this.hasPermission(requester, 'course.publish')) {
        throw new ForbiddenException('Only Academic Staff or Admin can create Master syllabus lessons.');
      }

      const data: any = {
        module: { connect: { id: dto.moduleId } },
        title: dto.title,
        contentType: dto.contentType,
        videoUrl: dto.videoUrl || null,
        videoDuration: dto.videoDuration || null,
        articleContent: dto.articleContent || null,
        isPreview: dto.isPreview ?? false,
        isUnlocked: dto.isUnlocked ?? true,
        status: (dto as any).status || 'published',
        createdBy: requester.sub,
      };

      const lesson = await this.lessonRepository.create(data);

      // Create the corresponding ModuleItem so the lesson appears in the ordered item list
      const maxItemOrder = await this.moduleItemRepository.getMaxOrderIndex(dto.moduleId);
      await this.moduleItemRepository.create({
        module: { connect: { id: dto.moduleId } },
        title: dto.title,
        type: 'lesson',
        referenceId: lesson.id,
        orderIndex: maxItemOrder + 1,
      });

      await this.createAuditLog({
        userId: requester.sub,
        action: 'course_lesson.create',
        entity: 'course_lesson',
        entityId: lesson.id,
        description: `Created lesson: ${lesson.title}`,
        newValues: lesson,
      });

      await this.triggerStatsUpdate(dto.moduleId);

      return this.toLessonResponseDTO(lesson);
    } catch (error: any) {
      if (error instanceof NotFoundException || error instanceof BadRequestException || error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error('Error creating lesson', error);
      throw new BadRequestException(`Failed to create lesson: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Update lesson
   */
  async update(requester: Requester, lessonId: string, dto: LessonUpdateDTO): Promise<LessonResponseDTO> {
    if (!this.hasPermission(requester, 'lesson.update')) {
      throw new ForbiddenException('Only authorized users can update lessons');
    }

    const existing = await this.lessonRepository.findById(lessonId);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Lesson with id ${lessonId} not found`);
    }

    if (!this.hasPermission(requester, 'course.publish')) {
      throw new ForbiddenException('Only Academic Staff or Admin can update Master syllabus lessons.');
    }

    try {
      const updateData: any = {};
      if (dto.title !== undefined) updateData.title = dto.title;
      if (dto.contentType !== undefined) updateData.contentType = dto.contentType;
      if (dto.videoUrl !== undefined) updateData.videoUrl = dto.videoUrl;
      if (dto.videoDuration !== undefined) updateData.videoDuration = dto.videoDuration;
      if (dto.articleContent !== undefined) updateData.articleContent = dto.articleContent;
      if (dto.isPreview !== undefined) updateData.isPreview = dto.isPreview;
      if (dto.isUnlocked !== undefined) updateData.isUnlocked = dto.isUnlocked;
      if ((dto as any).status !== undefined) updateData.status = (dto as any).status;

      if (Object.keys(updateData).length === 0) {
        return this.toLessonResponseDTO(existing);
      }

      const lesson = await this.lessonRepository.update(lessonId, updateData);

      await this.createAuditLog({
        userId: requester.sub,
        action: 'course_lesson.update',
        entity: 'course_lesson',
        entityId: lessonId,
        description: `Updated lesson: ${lesson.title}`,
        oldValues: existing,
        newValues: lesson,
      });

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
    if (!this.hasPermission(requester, 'course.publish')) {
      throw new ForbiddenException('Only Academic Staff or Admin can delete Master syllabus lessons.');
    }

    const existing = await this.lessonRepository.findById(lessonId);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Lesson with id ${lessonId} not found`);
    }

    try {
      if (hardDelete) {
        // Also delete the associated ModuleItem
        await this.moduleItemRepository.deleteByReferenceId(lessonId);
        await this.lessonRepository.delete(lessonId);
      } else {
        await this.lessonRepository.softDelete(lessonId);
      }

      await this.createAuditLog({
        userId: requester.sub,
        action: hardDelete ? 'course_lesson.hard_delete' : 'course_lesson.delete',
        entity: 'course_lesson',
        entityId: lessonId,
        description: `${hardDelete ? 'Hard deleted' : 'Soft deleted'} lesson: ${existing.title}`,
        oldValues: existing,
      });

      await this.triggerStatsUpdate(existing.moduleId);

      return { message: 'Lesson deleted successfully' };
    } catch (error: any) {
      throw new BadRequestException(`Failed to delete lesson: ${error?.message || 'Unknown error'}`);
    }
  }
}
