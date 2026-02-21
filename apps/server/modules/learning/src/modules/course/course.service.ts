import { Injectable, Logger, Inject, NotFoundException, BadRequestException, ForbiddenException, forwardRef } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { generateSlug } from '@server/shared';
import { Course, CourseStatus as PrismaCourseStatus } from '@prisma/generated';
import { validate as uuidValidate } from 'uuid';

import { CourseStatus } from '@workspace/schemas';
import type {
  CourseCreateDTO,
  CourseUpdateDTO,
  CourseResponseDTO,
  PaginationOptionsDTO,
  PaginatedResponseDTO,
  Requester,
} from '@workspace/schemas';

import type { ICourseService, IEnrollmentService } from '@server/learning/interfaces/services';
import type { ICourseRepository, IModuleRepository, ILessonRepository } from '@server/learning/interfaces/repositories';
import { COURSE_REPOSITORY_TOKEN, MODULE_REPOSITORY_TOKEN, LESSON_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories';
import { ENROLLMENT_SERVICE_TOKEN } from '@server/learning/interfaces/services';

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
    @Inject(forwardRef(() => ENROLLMENT_SERVICE_TOKEN))
    private readonly enrollmentService: IEnrollmentService,
  ) { }

  /**
   * Helper to check if requester has a specific permission
   */
  private hasPermission(requester: Requester, permission: string): boolean {
    if (!requester.permissions) return false;
    return requester.permissions.includes('*') || requester.permissions.includes(permission);
  }

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

  async findAll(options: PaginationOptionsDTO & { status?: CourseStatus; jlptLevel?: string; instructorId?: string }): Promise<PaginatedResponseDTO<CourseResponseDTO>> {
    try {
      const { page = 1, limit = 10, search, status, jlptLevel, instructorId } = options;
      // Ensure page and limit are numbers for Prisma
      const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
      const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;
      const skip = (pageNum - 1) * limitNum;

      const where: any = {
        deletedAt: null,
      };

      // Filter by status column
      if (status) {
        where.status = status;
      }

      // Filter by JLPT level
      if (jlptLevel) {
        where.jlptLevel = jlptLevel;
      }

      // Filter by Instructor
      if (instructorId) {
        where.instructors = {
          some: {
            lecturerId: instructorId,
          },
        };
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
          take: limitNum,
          where,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      const totalPages = Math.ceil(total / limitNum);

      return {
        data: courses.map(course => this.toCourseResponseDTO(course)),
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      };
    } catch (error: any) {
      this.logger.error('Failed to retrieve courses', error);
      throw new BadRequestException('Failed to retrieve courses');
    }
  }

  /**
   * Advanced search for client users
   */
  async advancedSearch(options: {
    page?: number;
    limit?: number;
    search?: string;
    levels?: string[];
    priceMin?: number;
    priceMax?: number;
    ratingMin?: number;
    sortBy?: string;
  }): Promise<PaginatedResponseDTO<CourseResponseDTO>> {
    try {
      const {
        page = 1,
        limit = 12,
        search,
        levels,
        priceMin,
        priceMax,
        ratingMin
      } = options;

      // Ensure page and limit are numbers for Prisma
      const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
      const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit;
      const skip = (pageNum - 1) * limitNum;

      // Force published status for client search
      const where: any = {
        deletedAt: null,
        status: 'published',
      };

      // Filter by JLPT levels
      if (levels && levels.length > 0) {
        where.jlptLevel = { in: levels };
      }

      // Filter by Price Range
      if (priceMin !== undefined || priceMax !== undefined) {
        where.price = {};
        if (priceMin !== undefined) where.price.gte = priceMin;
        if (priceMax !== undefined) where.price.lte = priceMax;
      }

      if (search) {
        const searchConditions = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { shortDescription: { contains: search, mode: 'insensitive' } },
        ];
        where.OR = searchConditions;
      }

      // Sorting
      let orderBy: any = { createdAt: 'desc' };
      if (options.sortBy) {
        switch (options.sortBy) {
          case 'price-asc':
            orderBy = { price: 'asc' };
            break;
          case 'price-desc':
            orderBy = { price: 'desc' };
            break;
          case 'oldest':
            orderBy = { createdAt: 'asc' };
            break;
          case 'popular':
            orderBy = { createdAt: 'desc' };
            break;
          default:
            orderBy = { createdAt: 'desc' };
        }
      }

      const [total, courses] = await Promise.all([
        this.courseRepository.count(where),
        this.courseRepository.findMany({
          skip,
          take: limitNum,
          where,
          orderBy,
        }),
      ]);

      const totalPages = Math.ceil(total / limitNum);

      return {
        data: courses.map(course => this.toCourseResponseDTO(course)),
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      };
    } catch (error: any) {
      this.logger.error('Failed to search courses', error);
      throw new BadRequestException('Failed to search courses');
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

    const dto = this.toCourseResponseDTO(course);

    // Force recalculate stats to ensure "Live" accuracy for Admin/Staff
    // This handles manual database edits being reflected in the UI
    await this.recalculateStats(courseId);
    
    // Refresh DTO values from database after recalculation
    const updated = await this.courseRepository.findById(courseId);
    if (updated) {
      dto.totalLessons = updated.totalLessons;
      dto.totalQuizzes = updated.totalQuizzes;
    }

    // Fetch instructors
    try {
      const instructors = await this.courseRepository.getInstructors(course.id);
      // @ts-ignore - Property 'instructors' does not exist on type 'CourseResponseDTO' until type definitions are fully propagated
      dto.instructors = instructors;
    } catch (error) {
      this.logger.warn(`Failed to fetch instructors for course ${course.id}`, error);
      // @ts-ignore
      dto.instructors = [];
    }

    return dto;
  }

  /**
   * Find course by slug
   */
  async findBySlug(slug: string): Promise<CourseResponseDTO> {
    const course = await this.courseRepository.findBySlug(slug);

    if (!course || course.deletedAt) {
      throw new NotFoundException(`Course with slug ${slug} not found`);
    }

    const dto = this.toCourseResponseDTO(course);

    // Fetch instructors
    try {
      const instructors = await this.courseRepository.getInstructors(course.id);
      // @ts-ignore - Property 'instructors' does not exist on type 'CourseResponseDTO' until type definitions are fully propagated
      dto.instructors = instructors;
    } catch (error) {
      this.logger.warn(`Failed to fetch instructors for course ${course.id}`, error);
      // @ts-ignore
      dto.instructors = [];
    }

    return dto;
  }

  /**
   * Create a new course
   */
  async create(requester: Requester, dto: CourseCreateDTO): Promise<CourseResponseDTO> {
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
        expirationMonths: (dto as any).expirationMonths || null,
        startDate: (dto as any).startDate || null,
        registrationClosedAt: (dto as any).registrationClosedAt || null,
        isFree: dto.isFree ?? false,
        tags: dto.tags || [],
        learningOutcomes: dto.learningOutcomes || [],
        requirements: dto.requirements || [],
        createdBy: requester.sub,
        status: 'draft',
      };

      // Validation: Paid courses must have price > 0
      if (!data.isFree && data.price <= 0) {
        throw new BadRequestException('Paid courses must have a price greater than 0');
      }

      // Validation: Course durationWeeks must be at most 26 (6 months)
      if (data.durationWeeks && data.durationWeeks > 26) {
        throw new BadRequestException('Course duration cannot exceed 26 weeks (6 months)');
      }

      // Validation: Course expirationMonths must be at most 6
      if (data.expirationMonths && data.expirationMonths > 6) {
        throw new BadRequestException('Course expiration duration cannot exceed 6 months');
      }

      // Validation: Live courses must have registrationClosedAt and expiresAt
      if (data.type === 'live') {
        if (!data.registrationClosedAt) {
          throw new BadRequestException('Live courses must have a registration deadline (registrationClosedAt)');
        }
        if (!data.expiresAt) {
          throw new BadRequestException('Live courses must have an end date (expiresAt)');
        }
        // Validation: course duration must be at most 6 months
        const anchor = data.startDate ? new Date(data.startDate) : new Date();
        const maxExpiry = new Date(anchor);
        maxExpiry.setMonth(maxExpiry.getMonth() + 6);
        if (new Date(data.expiresAt) > maxExpiry) {
          throw new BadRequestException('Live course duration cannot exceed 6 months from the start date');
        }
      }

      const course = await this.courseRepository.create(data);

      await this.createAuditLog({
        userId: requester.sub,
        action: 'course.create',
        entity: 'course',
        entityId: course.id,
        description: `Created course: ${course.title}`,
        newValues: course,
      });

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
    if (!this.hasPermission(requester, 'course.update')) {
      throw new ForbiddenException('You do not have permission to update courses');
    }

    const existing = await this.courseRepository.findById(courseId);

    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Course with id ${courseId} not found`);
    }

    // If user cannot publish courses (staff/admin only), check if they are assigned to the course
    if (!this.hasPermission(requester, 'course.publish')) {
      const isInstructor = await this.isInstructor(requester.sub, courseId);
      if (!isInstructor) {
        throw new ForbiddenException('You are not assigned to this course');
      }
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
      if ((dto as any).aiMetadata !== undefined) updateData.aiMetadata = (dto as any).aiMetadata;
      if (dto.thumbnailUrl !== undefined) updateData.thumbnailUrl = dto.thumbnailUrl;
      if (dto.previewVideoUrl !== undefined) updateData.previewVideoUrl = dto.previewVideoUrl;
      if (dto.price !== undefined) updateData.price = dto.price;
      if (dto.discountPrice !== undefined) updateData.discountPrice = dto.discountPrice;
      if (dto.liveConfig !== undefined) updateData.liveConfig = dto.liveConfig;
      if (dto.durationWeeks !== undefined) updateData.durationWeeks = dto.durationWeeks;
      if ((dto as any).expirationMonths !== undefined) updateData.expirationMonths = (dto as any).expirationMonths;
      if ((dto as any).startDate !== undefined) updateData.startDate = (dto as any).startDate;
      if ((dto as any).registrationClosedAt !== undefined) updateData.registrationClosedAt = (dto as any).registrationClosedAt;
      if (dto.isFree !== undefined) updateData.isFree = dto.isFree;
      if (dto.tags !== undefined) updateData.tags = dto.tags;
      if (dto.learningOutcomes !== undefined) updateData.learningOutcomes = dto.learningOutcomes;
      if (dto.requirements !== undefined) updateData.requirements = dto.requirements;

      // Validation: Paid courses must have price > 0
      const finalIsFree = dto.isFree !== undefined ? dto.isFree : existing.isFree;
      const finalPrice = dto.price !== undefined ? Number(dto.price) : Number(existing.price);

      if (!finalIsFree && finalPrice <= 0) {
        throw new BadRequestException('Paid courses must have a price greater than 0');
      }

      // Validation: Course durationWeeks must be at most 26 (6 months)
      const finalDurationWeeks = dto.durationWeeks !== undefined ? dto.durationWeeks : existing.durationWeeks;
      if (finalDurationWeeks && finalDurationWeeks > 26) {
        throw new BadRequestException('Course duration cannot exceed 26 weeks (6 months)');
      }

      // Validation: Course expirationMonths must be at most 6
      const finalExpirationMonths = (dto as any).expirationMonths !== undefined ? (dto as any).expirationMonths : (existing as any).expirationMonths;
      if (finalExpirationMonths && finalExpirationMonths > 6) {
        throw new BadRequestException('Course expiration duration cannot exceed 6 months');
      }

      // Validation: Live course duration must be at most 6 months
      const finalType = updateData.type ?? existing.type;
      if (finalType === 'live' && updateData.expiresAt) {
        const finalStartDate = updateData.startDate ?? (existing as any).startDate;
        const anchor = finalStartDate ? new Date(finalStartDate) : new Date();
        const maxExpiry = new Date(anchor);
        maxExpiry.setMonth(maxExpiry.getMonth() + 6);
        if (new Date(updateData.expiresAt) > maxExpiry) {
          throw new BadRequestException('Live course duration cannot exceed 6 months from the start date');
        }
      }

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

      await this.createAuditLog({
        userId: requester.sub,
        action: 'course.update',
        entity: 'course',
        entityId: courseId,
        description: `Updated course: ${course.title}`,
        oldValues: existing,
        newValues: course,
      });

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
    const permission = hardDelete ? 'course.delete' : 'course.delete'; // Both use same for now, or could use course.hard_delete if defined
    if (!this.hasPermission(requester, 'course.delete')) {
      throw new ForbiddenException('You do not have permission to delete courses');
    }

    const existing = await this.courseRepository.findById(courseId);

    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Course with id ${courseId} not found`);
    }

    try {
      if (hardDelete) {
        await this.courseRepository.delete(courseId);
      } else {
        await this.courseRepository.softDelete(courseId);
      }

      await this.createAuditLog({
        userId: requester.sub,
        action: hardDelete ? 'course.hard_delete' : 'course.delete',
        entity: 'course',
        entityId: courseId,
        description: `${hardDelete ? 'Hard deleted' : 'Soft deleted'} course: ${existing.title}`,
        oldValues: existing,
      });

      return { message: 'Course deleted successfully' };
    } catch (error: any) {
      throw new BadRequestException(`Failed to delete course: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Get featured courses
   * Note: Featured functionality removed. Use aiMetadata.featured or tags instead.
   */
  async getFeatured(): Promise<CourseResponseDTO[]> {
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
   * Submit a course for review
   */
  async submitForReview(requester: Requester, courseId: string): Promise<CourseResponseDTO> {
    if (!this.hasPermission(requester, 'course.update')) {
      throw new ForbiddenException('You do not have permission to submit courses for review');
    }

    const existing = await this.courseRepository.findById(courseId);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Course with id ${courseId} not found`);
    }

    if (existing.status === 'published') {
      throw new BadRequestException('Course is already published');
    }

    const course = await this.courseRepository.update(courseId, {
      status: (PrismaCourseStatus as any).pending_review,
      rejectionReason: null
    });

    await this.createAuditLog({
      userId: requester.sub,
      action: 'course.submit_for_review',
      entity: 'course',
      entityId: courseId,
      description: `Submitted course for review: ${existing.title}`,
      oldValues: existing,
      newValues: course,
    });

    return this.toCourseResponseDTO(course);
  }

  /**
   * Update livestream configuration.
   * Caller must have course.publish (admin/staff) or be an instructor assigned to this course.
   */
  async updateLiveConfig(requester: Requester, courseId: string, config: any): Promise<CourseResponseDTO> {
    const existing = await this.courseRepository.findById(courseId);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Course with id ${courseId} not found`);
    }

    if (existing.type !== 'live') {
      throw new BadRequestException('Only live courses can have livestream configuration');
    }

    const canPublishOrManage = this.hasPermission(requester, 'course.publish');
    if (!canPublishOrManage) {
      const isInstructor = await this.isInstructor(requester.sub, courseId);
      if (!isInstructor) {
        throw new ForbiddenException('You must be assigned to this course to update live configuration');
      }
    }

    const course = await this.courseRepository.update(courseId, { liveConfig: config });
    return this.toCourseResponseDTO(course);
  }

  /**
   * Publish a course (set approvedBy and approvedAt)
   */
  async publish(requester: Requester, courseId: string): Promise<CourseResponseDTO> {
    if (!this.hasPermission(requester, 'course.publish')) {
      throw new ForbiddenException('You do not have permission to publish courses');
    }

    const existing = await this.courseRepository.findById(courseId);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Course with id ${courseId} not found`);
    }

    const publishUpdateData: any = {
      approvedBy: requester.sub,
      approvedAt: new Date(),
      status: CourseStatus.PUBLISHED,
      rejectionReason: null, // Clear any previous rejection
    };

    const course = await this.courseRepository.update(courseId, publishUpdateData);

    await this.createAuditLog({
      userId: requester.sub,
      action: 'course.publish',
      entity: 'course',
      entityId: courseId,
      description: `Published course: ${existing.title}`,
      oldValues: existing,
      newValues: course,
    });

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
    if (!this.hasPermission(requester, 'course.publish')) {
      throw new ForbiddenException('Only authorized staff can unpublish courses');
    }

    const existing = await this.courseRepository.findById(courseId);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Course with id ${courseId} not found`);
    }

    const unpublishUpdateData: any = {
      status: CourseStatus.ARCHIVED,
    };

    const course = await this.courseRepository.update(courseId, unpublishUpdateData);

    await this.createAuditLog({
      userId: requester.sub,
      action: 'course.unpublish',
      entity: 'course',
      entityId: courseId,
      description: `Unpublished course (Archived): ${existing.title}`,
      oldValues: existing,
      newValues: course,
    });

    return this.toCourseResponseDTO(course);
  }

  /**
   * Reject a course (set status to rejected and add rejection reason)
   */
  async reject(requester: Requester, courseId: string, reason: string): Promise<CourseResponseDTO> {
    if (!this.hasPermission(requester, 'course.publish')) {
      throw new ForbiddenException('Only authorized staff can reject courses');
    }

    const existing = await this.courseRepository.findById(courseId);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Course with id ${courseId} not found`);
    }

    const rejectUpdateData: any = {
      approvedBy: requester.sub, // Track who rejected it
      status: CourseStatus.REJECTED,
      rejectionReason: reason,
    };

    const course = await this.courseRepository.update(courseId, rejectUpdateData);

    await this.createAuditLog({
      userId: requester.sub,
      action: 'course.reject',
      entity: 'course',
      entityId: courseId,
      description: `Rejected course: ${existing.title}. Reason: ${reason}`,
      oldValues: existing,
      newValues: course,
      metadata: { reason }
    });

    return this.toCourseResponseDTO(course);
  }

  /**
   * Get course curriculum (modules with lessons)
   */
  async getCurriculum(courseId: string, userId?: string): Promise<{
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
        videoUrl?: string;
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

    // Check enrollment if userId is provided
    let isEnrolled = false;
    if (userId) {
      try {
        isEnrolled = await this.enrollmentService.isEnrolled(userId, courseId);
      } catch (error) {
        this.logger.warn(`Failed to check enrollment for user ${userId} on course ${courseId}`, error);
      }
    }

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
          lessons: lessons.map((lesson) => {
            // Unlocked if (preview OR enrolled) AND marked unlocked in DB
            const isAccessible = (lesson.isPreview || isEnrolled) && lesson.isUnlocked;

            return {
              id: lesson.id,
              title: lesson.title,
              contentType: lesson.contentType,
              videoDuration: lesson.videoDuration || undefined,
              videoUrl: isAccessible ? (lesson.videoUrl || undefined) : undefined,
              order: lesson.orderIndex,
              isPreview: lesson.isPreview,
              isUnlocked: isAccessible,
            };
          }),
        };
      })
    );

    return {
      modules: modulesWithLessons,
    };
  }

  /**
   * Recalculate course statistics (totalLessons, totalQuizzes)
   * Only counts published items
   */
  async recalculateStats(courseId: string): Promise<void> {
    try {
      const totalLessons = await this.courseRepository.countLessons(courseId);
      const totalQuizzes = await this.courseRepository.countQuizzes(courseId);

      await this.courseRepository.updateStats(courseId, { totalLessons, totalQuizzes });
      this.logger.log(`Recalculated stats for course ${courseId}: totalLessons=${totalLessons}, totalQuizzes=${totalQuizzes}`);
    } catch (error: any) {
      this.logger.error(`Failed to recalculate stats for course ${courseId}`, error);
    }
  }

  /**
   * Check if a user is an instructor for a course
   */
  async isInstructor(userId: string, courseId: string): Promise<boolean> {
    try {
      const instructors = await this.courseRepository.getInstructors(courseId);
      return instructors.some(instructor => instructor.userId === userId);
    } catch (error) {
      this.logger.error(`Failed to check if user ${userId} is instructor for course ${courseId}`, error);
      return false;
    }
  }

}

