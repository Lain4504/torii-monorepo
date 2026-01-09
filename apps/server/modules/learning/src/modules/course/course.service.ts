import { Injectable, Logger, Inject, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { generateSlug } from '@server/shared';
import type { Course } from '@prisma/generated';
import { validate as uuidValidate } from 'uuid';

import { UserRole, CourseStatus } from '@workspace/schemas';
import type {
  CourseCreateDTO,
  CourseUpdateDTO,
  CourseResponseDTO,
  PaginationOptionsDTO,
  PaginatedResponseDTO,
  Requester,
} from '@workspace/schemas';

import type { ICourseService } from '../../interfaces/services';
import type { ICourseRepository, IModuleRepository, ILessonRepository } from '../../interfaces/repositories';
import { COURSE_REPOSITORY_TOKEN, MODULE_REPOSITORY_TOKEN, LESSON_REPOSITORY_TOKEN } from '../../interfaces/repositories';

/**
 * Course Service
 * Handles course business logic operations
 */
@Injectable()
export class CourseService implements ICourseService {
  private readonly logger = new Logger(CourseService.name);

  constructor(
    @Inject(COURSE_REPOSITORY_TOKEN)
    private readonly courseRepository: ICourseRepository,
    @Inject(MODULE_REPOSITORY_TOKEN)
    private readonly moduleRepository: IModuleRepository,
    @Inject(LESSON_REPOSITORY_TOKEN)
    private readonly lessonRepository: ILessonRepository,
    @Inject('NATS_SERVICE')
    private readonly natsClient: ClientProxy,
    @InjectMapper() private readonly mapper: Mapper,
  ) { }

  /**
   * Map Course entity to CourseResponseDTO using AutoMapper
   */
  private toCourseResponseDTO(course: Course): CourseResponseDTO {
    return this.mapper.map<Course, CourseResponseDTO>(course, 'Course', 'CourseResponseDTO');
  }

  /**
   * Ensure unique slug by appending date and timestamp if needed
   */
  private async ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    let slug = `${baseSlug}-${dateStr}`;

    const exists = await this.courseRepository.slugExists(slug, excludeId);

    if (!exists) {
      return slug;
    }

    // If slug exists, append timestamp to ensure uniqueness
    const timestamp = Date.now();
    return `${baseSlug}-${dateStr}-${timestamp}`;
  }

  async findAll(options: PaginationOptionsDTO & { status?: CourseStatus; jlptLevel?: string }): Promise<PaginatedResponseDTO<CourseResponseDTO>> {
    try {
      const { page = 1, limit = 10, search, status, jlptLevel } = options;
      const skip = (page - 1) * limit;

      const where: any = {
        deletedAt: null,
      };

      // Filter by status column
      if (status) {
        if (status === CourseStatus.PUBLISHED) {
          where.status = 'published';
        } else if (status === CourseStatus.DRAFT) {
          where.status = 'draft';
        }
      }

      // Filter by JLPT level
      if (jlptLevel) {
        where.jlptLevel = jlptLevel;
      }

      if (search) {
        const searchConditions = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { shortDescription: { contains: search, mode: 'insensitive' } },
        ];

        where.OR = searchConditions;
      }

      const [total, courses] = await Promise.all([
        this.courseRepository.count(where),
        this.courseRepository.findMany({
          skip,
          take: limit,
          where,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: courses.map(course => this.toCourseResponseDTO(course)),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error: any) {
      this.logger.error('Failed to retrieve courses', error);
      throw new BadRequestException('Failed to retrieve courses');
    }
  }

  /**
   * Find one course by ID
   */
  async findOne(courseId: string): Promise<CourseResponseDTO> {
    const course = await this.courseRepository.findById(courseId);

    if (!course || course.deletedAt) {
      throw new NotFoundException(`Course with id ${courseId} not found`);
    }

    return this.toCourseResponseDTO(course);
  }

  /**
   * Find course by slug
   */
  async findBySlug(slug: string): Promise<CourseResponseDTO> {
    const course = await this.courseRepository.findBySlug(slug);

    if (!course || course.deletedAt) {
      throw new NotFoundException(`Course with slug ${slug} not found`);
    }

    return this.toCourseResponseDTO(course);
  }

  /**
   * Create a new course
   */
  async create(requester: Requester, dto: CourseCreateDTO): Promise<CourseResponseDTO> {
    // Check permissions (only ADMIN and LECTURER can create courses)
    if (![UserRole.ADMIN, UserRole.LECTURER].includes(requester.role as UserRole)) {
      throw new ForbiddenException('Only admins and lecturers can create courses');
    }

    try {
      // Generate unique slug
      const baseSlug = generateSlug(dto.title);
      const slug = await this.ensureUniqueSlug(baseSlug);

      const data: any = {
        title: dto.title,
        slug,
        type: dto.type || 'vod',
        description: dto.description || null,
        shortDescription: dto.shortDescription || null,
        jlptLevel: dto.jlptLevel || null,
        aiMetadata: dto.aiMetadata || {},
        thumbnailUrl: dto.thumbnailUrl || null,
        previewVideoUrl: dto.previewVideoUrl || null,
        price: dto.price ?? 0,
        discountPrice: dto.discountPrice || null,
        liveConfig: dto.liveConfig || null,
        durationWeeks: dto.durationWeeks || null,
        isFree: dto.isFree ?? false,
        tags: dto.tags || [],
        learningOutcomes: dto.learningOutcomes || [],
        requirements: dto.requirements || [],
        createdBy: requester.sub,
        status: 'draft',
      };

      const course = await this.courseRepository.create(data);
      return this.toCourseResponseDTO(course);
    } catch (error: any) {
      this.logger.error('Error creating course', error);
      throw new BadRequestException(`Failed to create course: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Update course
   */
  async update(requester: Requester, courseId: string, dto: CourseUpdateDTO): Promise<CourseResponseDTO> {
    // Check permissions
    if (![UserRole.ADMIN, UserRole.LECTURER].includes(requester.role as UserRole)) {
      throw new ForbiddenException('Only admins and lecturers can update courses');
    }

    const existing = await this.courseRepository.findById(courseId);

    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Course with id ${courseId} not found`);
    }

    try {
      const updateData: any = {};

      // Handle slug update if title changes
      if (dto.title && dto.title !== existing.title) {
        const baseSlug = generateSlug(dto.title);
        updateData.slug = await this.ensureUniqueSlug(baseSlug, courseId);
        updateData.title = dto.title;
      }

      // Update other fields
      if (dto.type !== undefined) updateData.type = dto.type;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.shortDescription !== undefined) updateData.shortDescription = dto.shortDescription;
      if (dto.jlptLevel !== undefined) updateData.jlptLevel = dto.jlptLevel;
      if (dto.aiMetadata !== undefined) updateData.aiMetadata = dto.aiMetadata;
      if (dto.thumbnailUrl !== undefined) updateData.thumbnailUrl = dto.thumbnailUrl;
      if (dto.previewVideoUrl !== undefined) updateData.previewVideoUrl = dto.previewVideoUrl;
      if (dto.price !== undefined) updateData.price = dto.price;
      if (dto.discountPrice !== undefined) updateData.discountPrice = dto.discountPrice;
      if (dto.liveConfig !== undefined) updateData.liveConfig = dto.liveConfig;
      if (dto.durationWeeks !== undefined) updateData.durationWeeks = dto.durationWeeks;
      if (dto.isFree !== undefined) updateData.isFree = dto.isFree;
      if (dto.tags !== undefined) updateData.tags = dto.tags;
      if (dto.learningOutcomes !== undefined) updateData.learningOutcomes = dto.learningOutcomes;
      if (dto.requirements !== undefined) updateData.requirements = dto.requirements;

      let isPublishing = false;

      if (dto.approvedBy !== undefined) {
        // Explicit approval
        const validApprovedBy = dto.approvedBy && uuidValidate(dto.approvedBy)
          ? dto.approvedBy
          : requester.sub;
        updateData.approvedBy = validApprovedBy;
        updateData.approvedAt = new Date();
        updateData.status = 'published';
        isPublishing = true;
      }

      if (Object.keys(updateData).length === 0) {
        return this.toCourseResponseDTO(existing);
      }

      const course = await this.courseRepository.update(courseId, updateData);

      // Emit event if publishing
      if (isPublishing) {
        try {
          this.logger.log(`Course ${course.id} published, emitting event`);
          this.natsClient.emit(
            { cmd: 'course.published' },
            {
              courseId: course.id,
              courseTitle: course.title,
              courseJlptLevel: course.jlptLevel,
            },
          );
        } catch (error: any) {
          this.logger.error(`Failed to emit course.published event: ${error?.message}`, error);
        }
      }

      return this.toCourseResponseDTO(course);
    } catch (error: any) {
      this.logger.error('Error updating course', error);
      throw new BadRequestException(`Failed to update course: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Delete course
   */
  async delete(requester: Requester, courseId: string, hardDelete = false): Promise<{ message: string }> {
    if (requester.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only admins can delete courses');
    }

    const existing = await this.courseRepository.findById(courseId);

    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Course with id ${courseId} not found`);
    }

    try {
      if (hardDelete) {
        await this.courseRepository.delete(courseId);
      }
      else {
        await this.courseRepository.softDelete(courseId);
      }

      return { message: 'Course deleted successfully' };
    }
    catch (error: any) {
      throw new BadRequestException(`Failed to delete course: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Get featured courses
   * Note: Featured functionality removed. Use aiMetadata.featured or tags instead.
   * This method is kept for backward compatibility but returns empty array.
   * TODO: Remove this method or implement via aiMetadata/tags filtering
   */
  async getFeatured(): Promise<CourseResponseDTO[]> {
    // Featured courses removed - can be implemented via aiMetadata or tags if needed
    this.logger.warn('getFeatured() called but featured field is removed. Consider using aiMetadata or tags.');
    return [];
  }

  /**
   * Get courses by type
   */
  async getByType(type: 'vod' | 'live'): Promise<CourseResponseDTO[]> {
    const courses = await this.courseRepository.findByType(type);
    return courses.map(course => this.toCourseResponseDTO(course));
  }

  /**
   * Publish a course (set approvedBy and approvedAt)
   */
  async publish(requester: Requester, courseId: string): Promise<CourseResponseDTO> {
    if (![UserRole.ADMIN, UserRole.LECTURER].includes(requester.role as UserRole)) {
      throw new ForbiddenException('Only admins and lecturers can publish courses');
    }

    const existing = await this.courseRepository.findById(courseId);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Course with id ${courseId} not found`);
    }

    const publishUpdateData: any = {
      approvedBy: requester.sub,
      approvedAt: new Date(),
      status: 'published',
    };

    const course = await this.courseRepository.update(courseId, publishUpdateData);

    // Emit event
    try {
      this.logger.log(`Course ${course.id} published, emitting event`);
      this.natsClient.emit(
        { cmd: 'course.published' },
        {
          courseId: course.id,
          courseTitle: course.title,
          courseJlptLevel: course.jlptLevel,
        },
      );
    } catch (error: any) {
      this.logger.error(`Failed to emit course.published event: ${error?.message}`, error);
    }

    return this.toCourseResponseDTO(course);
  }

  /**
   * Unpublish a course (clear approvedBy and approvedAt)
   */
  async unpublish(requester: Requester, courseId: string): Promise<CourseResponseDTO> {
    if (![UserRole.ADMIN, UserRole.LECTURER].includes(requester.role as UserRole)) {
      throw new ForbiddenException('Only admins and lecturers can unpublish courses');
    }

    const existing = await this.courseRepository.findById(courseId);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Course with id ${courseId} not found`);
    }

    const unpublishUpdateData: any = {
      approvedBy: null,
      approvedAt: null,
      status: 'draft',
    };

    const course = await this.courseRepository.update(courseId, unpublishUpdateData);

    return this.toCourseResponseDTO(course);
  }

  /**
   * Get course curriculum (modules with lessons)
   */
  async getCurriculum(courseId: string): Promise<{
    modules: Array<{
      id: string;
      title: string;
      description?: string;
      order: number;
      durationMinutes?: number;
      lessons: Array<{
        id: string;
        title: string;
        contentType: string;
        videoDuration?: number;
        order: number;
        isPreview: boolean;
        isUnlocked: boolean;
      }>;
    }>;
  }> {
    // Verify course exists
    const course = await this.courseRepository.findById(courseId);
    if (!course || course.deletedAt) {
      throw new NotFoundException(`Course with id ${courseId} not found`);
    }

    // Get all modules for the course
    const modules = await this.moduleRepository.findByCourseId(courseId);

    // Get lessons for each module
    const modulesWithLessons = await Promise.all(
      modules.map(async (module) => {
        const lessons = await this.lessonRepository.findByModuleId(module.id);

        return {
          id: module.id,
          title: module.title,
          description: module.description || undefined,
          order: module.orderIndex,
          durationMinutes: module.durationMinutes || undefined,
          lessons: lessons.map((lesson) => ({
            id: lesson.id,
            title: lesson.title,
            contentType: lesson.contentType,
            videoDuration: lesson.videoDuration || undefined,
            order: lesson.orderIndex,
            isPreview: lesson.isPreview,
            isUnlocked: lesson.isUnlocked,
          })),
        };
      })
    );

    return {
      modules: modulesWithLessons,
    };
  }
}
