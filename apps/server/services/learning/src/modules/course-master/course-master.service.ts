import { Injectable, Logger, Inject, NotFoundException, BadRequestException, ForbiddenException, forwardRef } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { generateSlug, PrismaService } from '@server/shared';
import { CourseMaster, CourseMasterStatus as PrismaCourseMasterStatus } from '@prisma/generated';
import { validate as uuidValidate } from 'uuid';

import { CourseMasterStatus } from '@workspace/schemas';
import type {
  CourseMasterCreateDTO,
  CourseMasterUpdateDTO,
  CourseMasterResponseDTO,
  CourseMasterSearchResponseDTO,
  PaginationOptionsDTO,
  PaginatedResponseDTO,
  Requester,
} from '@workspace/schemas';

import type { ICourseMasterService, IEnrollmentService } from '@server/learning/interfaces/services';
import type { ICourseMasterRepository, IModuleRepository, ILessonRepository } from '@server/learning/interfaces/repositories';
import { COURSE_MASTER_REPOSITORY_TOKEN, MODULE_REPOSITORY_TOKEN, LESSON_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories';
import { ENROLLMENT_SERVICE_TOKEN } from '@server/learning/interfaces/services';

/**
 * Course Master Service
 * Handles course master business logic operations
 */
@Injectable()
export class CourseMasterService implements ICourseMasterService {
  private readonly logger = new Logger(CourseMasterService.name);

  constructor(
    @Inject(COURSE_MASTER_REPOSITORY_TOKEN)
    private readonly courseRepository: ICourseMasterRepository,
    @Inject(MODULE_REPOSITORY_TOKEN)
    private readonly moduleRepository: IModuleRepository,
    @Inject(LESSON_REPOSITORY_TOKEN)
    private readonly lessonRepository: ILessonRepository,
    @Inject('NATS_SERVICE')
    private readonly natsClient: ClientProxy,
    @InjectMapper() private readonly mapper: Mapper,
    @Inject(forwardRef(() => ENROLLMENT_SERVICE_TOKEN))
    private readonly enrollmentService: IEnrollmentService,
    private readonly prisma: PrismaService,
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
   * Map Course Master entity to CourseMasterResponseDTO using AutoMapper
   */
  private async toCourseMasterResponseDTO(course: CourseMaster): Promise<CourseMasterResponseDTO> {
    const dto = this.mapper.map<CourseMaster, CourseMasterResponseDTO>(course, 'CourseMaster', 'CourseMasterResponseDTO');

    // Enrich with latest version tag
    try {
      const latestVersion = await this.courseRepository.getLatestVersion(course.id);
      if (latestVersion) {
        (dto as any).latestVersionTag = latestVersion.versionTag;
      }
    } catch (error) {
      this.logger.warn(`Failed to fetch latest version for course ${course.id}`);
    }

    return dto;
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

  async findAll(options: PaginationOptionsDTO & { status?: CourseMasterStatus; jlptLevel?: string; instructorId?: string }): Promise<PaginatedResponseDTO<CourseMasterResponseDTO>> {
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

      // Filter by Instructor (lecturerId)
      if (instructorId) {
        where.lecturerId = instructorId;
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
        data: await Promise.all(courses.map(course => this.toCourseMasterResponseDTO(course))),
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      };
    } catch (error: any) {
      this.logger.error('Failed to retrieve course masters', error);
      throw new BadRequestException('Failed to retrieve course masters');
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
    type?: string;
  }): Promise<PaginatedResponseDTO<CourseMasterResponseDTO>> {
    try {
      const {
        page = 1,
        limit = 12,
        search,
        levels,
        priceMin,
        priceMax,
        ratingMin,
        type,
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

      // Filter by type (VOD | LIVE)
      if (type && ['VOD', 'LIVE'].includes(type.toUpperCase())) {
        where.type = type.toUpperCase();
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
          case 'oldest':
            orderBy = { createdAt: 'asc' };
            break;
          case 'popular':
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
        data: await Promise.all(courses.map(course => this.toCourseMasterResponseDTO(course as any))),
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      };
    } catch (error: any) {
      this.logger.error('Failed to search course masters', error);
      throw new BadRequestException('Failed to search course masters');
    }
  }

  /**
   * Find one course master by ID
   */
  async findById(courseMasterId: string): Promise<CourseMasterResponseDTO> {
    const course = await this.courseRepository.findById(courseMasterId);

    if (!course || course.deletedAt) {
      throw new NotFoundException(`Course master with id ${courseMasterId} not found`);
    }

    const dto = await this.toCourseMasterResponseDTO(course);



    // Fetch lecturer
    try {
      const lecturer = await this.courseRepository.getLecturer(course.id);
      dto.lecturer = lecturer;
    } catch (error) {
      this.logger.warn(`Failed to fetch lecturer for course master ${course.id}`, error);
      dto.lecturer = null;
    }

    return dto;
  }

  /**
   * Find course master by slug
   */
  async findBySlug(slug: string): Promise<CourseMasterResponseDTO> {
    const course = await this.courseRepository.findBySlug(slug);

    if (!course || course.deletedAt) {
      throw new NotFoundException(`Course master with slug ${slug} not found`);
    }

    const dto = await this.toCourseMasterResponseDTO(course);

    // Fetch lecturer
    try {
      const lecturer = await this.courseRepository.getLecturer(course.id);
      dto.lecturer = lecturer;
    } catch (error) {
      this.logger.warn(`Failed to fetch lecturer for course master ${course.id}`, error);
      dto.lecturer = null;
    }

    return dto;
  }

  /**
   * Create a new course master
   */
  async create(requester: Requester, dto: CourseMasterCreateDTO): Promise<CourseMasterResponseDTO> {
    try {
      // Business Rule: Only admin and staff-lms can create course masters
      if (requester.role?.toLowerCase() === 'lecturer') {
        throw new ForbiddenException('Lecturers cannot create courses. Courses must be assigned by admin or LMS staff.');
      }

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
        tags: dto.tags || [],
        learningOutcomes: dto.learningOutcomes || [],
        requirements: dto.requirements || [],
        createdBy: requester.sub,
        status: 'draft',
      };

      // Validation: Course expirationMonths must be at most 6
      if (data.expirationMonths && data.expirationMonths > 6) {
        throw new BadRequestException('Course expiration duration cannot exceed 6 months');
      }

      const course = await this.courseRepository.create(data);

      await this.createAuditLog({
        userId: requester.sub,
        action: 'course-master.create',
        entity: 'course-master',
        entityId: course.id,
        description: `Created course master: ${course.title}`,
        newValues: course,
      });

      return await this.toCourseMasterResponseDTO(course);
    } catch (error: any) {
      this.logger.error('Error creating course master', error);
      throw new BadRequestException(`Failed to create course master: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Update course master
   * If course is PUBLISHED and has substantive changes, auto-revert to PENDING_REVIEW
   */
  async update(requester: Requester, courseMasterId: string, dto: CourseMasterUpdateDTO): Promise<CourseMasterResponseDTO> {
    // Check permissions
    if (!this.hasPermission(requester, 'course.update')) {
      throw new ForbiddenException('You do not have permission to update course masters');
    }

    const existing = await this.courseRepository.findById(courseMasterId);

    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Course master with id ${courseMasterId} not found`);
    }

    // Business Rule: ONLY Admin or Staff-LMS (Academic) can update the Master Syllabus template.
    // Lecturers can only view and suggest changes, but not edit directly to prevent template drift.
    if (!this.hasPermission(requester, 'course.publish')) {
      throw new ForbiddenException('Only Academic Staff or Admin can update the Course Master syllabus.');
    }

    try {
      const updateData: any = {};

      // Handle slug update if title changes
      if (dto.title && dto.title !== existing.title) {
        const baseSlug = generateSlug(dto.title);
        updateData.slug = await this.ensureUniqueSlug(baseSlug, courseMasterId);
        updateData.title = dto.title;
      }

      // Update other fields
      if (dto.type !== undefined) updateData.type = dto.type;
      if (dto.description !== undefined) updateData.description = dto.description;
      if (dto.shortDescription !== undefined) updateData.shortDescription = dto.shortDescription;
      if (dto.jlptLevel !== undefined) updateData.jlptLevel = dto.jlptLevel;
      if ((dto as any).aiMetadata !== undefined) updateData.aiMetadata = (dto as any).aiMetadata;
      if (dto.tags !== undefined) updateData.tags = dto.tags;
      if (dto.learningOutcomes !== undefined) updateData.learningOutcomes = dto.learningOutcomes;
      if (dto.requirements !== undefined) updateData.requirements = dto.requirements;

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
      let isAutoReverting = false;

      if (dto.approvedBy !== undefined) {
        // Explicit approval
        const validApprovedBy = dto.approvedBy && uuidValidate(dto.approvedBy)
          ? dto.approvedBy
          : requester.sub;
        updateData.approvedBy = validApprovedBy;
        updateData.approvedAt = new Date();
        updateData.status = 'published';
        isPublishing = true;
      } else if (Object.keys(updateData).length > 0 && existing.status === 'published') {
        // Auto-revert PUBLISHED course to PENDING_REVIEW when content changes
        // This ensures staff review the changes before learners see them
        this.logger.log(`Auto-reverting published course ${courseMasterId} to PENDING_REVIEW due to content updates`);
        updateData.status = 'pending_review';
        updateData.isSubmittedForReview = true;
        updateData.rejectionReason = null; // Clear any previous rejection reason
        isAutoReverting = true;
      }

      if (Object.keys(updateData).length === 0) {
        return await this.toCourseMasterResponseDTO(existing);
      }

      const course = await this.courseRepository.update(courseMasterId, updateData);

      await this.createAuditLog({
        userId: requester.sub,
        action: 'course-master.update',
        entity: 'course-master',
        entityId: courseMasterId,
        description: `Updated course master: ${course.title}${isAutoReverting ? ' (auto-reverted to PENDING_REVIEW for review)' : ''}`,
        oldValues: existing,
        newValues: course,
        metadata: { isAutoReverting }
      });

      // Emit event if publishing
      if (isPublishing) {
        try {
          this.logger.log(`Course master ${course.id} published, emitting event`);
          this.natsClient.emit(
            { cmd: 'course-master.published' },
            {
              courseMasterId: course.id,
              courseTitle: course.title,
              courseJlptLevel: course.jlptLevel,
            },
          );
        } catch (error: any) {
          this.logger.error(`Failed to emit course-master.published event: ${error?.message}`, error);
        }
      }

      // Emit event if auto-reverting
      if (isAutoReverting) {
        try {
          this.logger.log(`Course master ${course.id} auto-reverted to PENDING_REVIEW, emitting event`);
          this.natsClient.emit(
            { cmd: 'course-master.submitted-for-review' },
            {
              courseMasterId: course.id,
              courseTitle: course.title,
              submittedBy: requester.sub,
              reason: 'Auto-submitted due to content updates',
            },
          );
        } catch (error: any) {
          this.logger.error(`Failed to emit course-master.submitted-for-review event: ${error?.message}`, error);
        }
      }

      return await this.toCourseMasterResponseDTO(course);
    } catch (error: any) {
      this.logger.error('Error updating course master', error);
      throw new BadRequestException(`Failed to update course master: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Delete course master
   */
  async delete(requester: Requester, courseMasterId: string, hardDelete = false): Promise<{ message: string }> {
    if (!this.hasPermission(requester, 'course.delete')) {
      throw new ForbiddenException('You do not have permission to delete course masters');
    }

    const existing = await this.courseRepository.findById(courseMasterId);

    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Course master with id ${courseMasterId} not found`);
    }

    try {
      if (hardDelete) {
        await this.courseRepository.delete(courseMasterId);
      } else {
        await this.courseRepository.softDelete(courseMasterId);
      }

      await this.createAuditLog({
        userId: requester.sub,
        action: hardDelete ? 'course-master.hard_delete' : 'course-master.delete',
        entity: 'course-master',
        entityId: courseMasterId,
        description: `${hardDelete ? 'Hard deleted' : 'Soft deleted'} course master: ${existing.title}`,
        oldValues: existing,
      });

      return { message: 'Course master deleted successfully' };
    } catch (error: any) {
      throw new BadRequestException(`Failed to delete course master: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Get featured course masters
   */
  async getFeatured(): Promise<CourseMasterResponseDTO[]> {
    this.logger.warn('getFeatured() called but featured field is removed.');
    return [];
  }

  /**
   * Get course masters by type
   */
  async getByType(type: 'vod' | 'live'): Promise<CourseMasterResponseDTO[]> {
    const courses = await this.courseRepository.findByType(type);
    return await Promise.all(courses.map(course => this.toCourseMasterResponseDTO(course)));
  }

  /**
   * Submit a course master for review
   */
  async submitForReview(requester: Requester, courseMasterId: string): Promise<CourseMasterResponseDTO> {
    if (!this.hasPermission(requester, 'course.update')) {
      throw new ForbiddenException('You do not have permission to submit course masters for review');
    }

    const existing = await this.courseRepository.findById(courseMasterId);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Course master with id ${courseMasterId} not found`);
    }

    if (existing.status === 'published') {
      throw new BadRequestException('Course master is already published');
    }

    const course = await this.courseRepository.update(courseMasterId, {
      status: (PrismaCourseMasterStatus as any).pending_review,
      rejectionReason: null
    });

    await this.createAuditLog({
      userId: requester.sub,
      action: 'course-master.submit_for_review',
      entity: 'course-master',
      entityId: courseMasterId,
      description: `Submitted course master for review: ${existing.title}`,
      oldValues: existing,
      newValues: course,
    });

    return await this.toCourseMasterResponseDTO(course);
  }

  /**
   * Update livestream configuration.
   */
  async updateLiveConfig(requester: Requester, courseMasterId: string, config: any): Promise<CourseMasterResponseDTO> {
    const existing = await this.courseRepository.findById(courseMasterId);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Course master with id ${courseMasterId} not found`);
    }

    if (existing.type !== 'live') {
      throw new BadRequestException('Only live course masters can have livestream configuration');
    }

    // Business Rule: ONLY Admin or Staff-LMS (Academic) can update lessons in the Master Syllabus.
    // Lecturers must not edit the blueprint as it impacts all class runs.
    if (!this.hasPermission(requester, 'course.publish')) {
      throw new ForbiddenException('Only Academic Staff or Admin can update Master syllabus lessons.');
    }

    const canPublishOrManage = this.hasPermission(requester, 'course.publish');
    if (!canPublishOrManage) {
      const isInstructor = await this.isInstructor(requester.sub, courseMasterId);
      if (!isInstructor) {
        throw new ForbiddenException('You must be assigned to this course master to update live configuration');
      }
    }

    // Live configuration is now managed at CourseRun level.
    // Keep this method as a no-op for backward compatibility.
    this.logger.warn('updateLiveConfig is deprecated: live configuration is now managed on CourseRun entities.');
    return await this.toCourseMasterResponseDTO(existing);
  }

  /**
   * Publish a course master (set approvedBy and approvedAt)
   * Also creates a CourseVersion snapshot.
   */
  async publish(requester: Requester, courseMasterId: string): Promise<CourseMasterResponseDTO> {
    if (!this.hasPermission(requester, 'course.publish')) {
      throw new ForbiddenException('You do not have permission to publish course masters');
    }

    const existing = await this.courseRepository.findById(courseMasterId);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Course master with id ${courseMasterId} not found`);
    }

    const publishUpdateData: any = {
      approvedBy: requester.sub,
      approvedAt: new Date(),
      status: CourseMasterStatus.PUBLISHED,
      rejectionReason: null, // Clear any previous rejection
    };

    const course = await this.courseRepository.update(courseMasterId, publishUpdateData);

    // Create a new CourseVersion snapshot
    try {
      // 1. Fetch modules and lessons
      const modules = await this.moduleRepository.findByCourseId(courseMasterId);
      const curriculumSnapshot = await Promise.all(
        modules.map(async (module) => {
          const lessons = await this.lessonRepository.findByModuleId(module.id);
          return {
            id: module.id,
            title: module.title,
            description: module.description,
            orderIndex: module.orderIndex,
            durationMinutes: module.durationMinutes,
            lessons: lessons.map(lesson => ({
              id: lesson.id,
              title: lesson.title,
              contentType: lesson.contentType,
              videoUrl: lesson.videoUrl,
              videoDuration: lesson.videoDuration,
              articleContent: lesson.articleContent,
              orderIndex: lesson.orderIndex,
              isPreview: lesson.isPreview,
              isUnlocked: lesson.isUnlocked,
            })),
          };
        })
      );

      // 2. Determine version tag
      const latestVersion = await this.courseRepository.getLatestVersion(courseMasterId);
      let nextVersionNumber = 1;
      if (latestVersion && latestVersion.versionTag.startsWith('v')) {
        const currentVersion = parseFloat(latestVersion.versionTag.substring(1));
        if (!isNaN(currentVersion)) {
          nextVersionNumber = Math.floor(currentVersion) + 1;
        }
      }
      const versionTag = `v${nextVersionNumber}.0`;

      // Create a new CourseVersion snapshot
      const newVersion = await this.courseRepository.createVersion({
        courseMaster: { connect: { id: courseMasterId } },
        versionTag,
        curriculumSnapshot: curriculumSnapshot as any,
        changelog: `Published version ${versionTag}`,
      });
      this.logger.log(`Created new CourseVersion ${versionTag} for course master ${courseMasterId}`);

      if (course.type === 'vod') {
        try {
          // Check if any run already exists
          const existingRunsResult = await lastValueFrom(
            this.natsClient.send({ cmd: 'learning.courserun.findAll' }, { courseMasterId: course.id, limit: 1 })
          );

          const existingRuns = (existingRunsResult as any).data;

          if (!existingRuns || existingRuns.length === 0) {
            this.logger.log(`Automatically creating default VOD run for syllabus ${course.id}`);
            await lastValueFrom(
              this.natsClient.send({ cmd: 'learning.courserun.create' }, {
                courseMasterId: course.id,
                title: `${course.title} (VOD)`,
                versionId: latestVersion ? latestVersion.id : undefined,
                price: 0,
                status: 'enrolling', // VOD is generally always enrolling once published
              })
            );
          }
        } catch (runError: any) {
          this.logger.error(`Failed to create default VOD run: ${runError.message}`);
        }
      }
    } catch (error: any) {
      this.logger.error(`Failed to create course version snapshot: ${error?.message}`, error);
    }

    await this.createAuditLog({
      userId: requester.sub,
      action: 'course-master.publish',
      entity: 'course-master',
      entityId: courseMasterId,
      description: `Published course master: ${existing.title}`,
      oldValues: existing,
      newValues: course,
    });

    // Emit event
    try {
      this.logger.log(`Course master ${course.id} published, emitting event`);
      this.natsClient.emit(
        { cmd: 'course-master.published' },
        {
          courseMasterId: course.id,
          courseTitle: course.title,
          courseJlptLevel: course.jlptLevel,
        },
      );
    } catch (error: any) {
      this.logger.error(`Failed to emit course-master.published event: ${error?.message}`, error);
    }

    return await this.toCourseMasterResponseDTO(course);
  }

  /**
   * Unpublish a course master (set status to archived)
   */
  async unpublish(requester: Requester, courseMasterId: string): Promise<CourseMasterResponseDTO> {
    if (!this.hasPermission(requester, 'course.publish')) {
      throw new ForbiddenException('Only authorized staff can unpublish course masters');
    }

    const existing = await this.courseRepository.findById(courseMasterId);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Course master with id ${courseMasterId} not found`);
    }

    const unpublishUpdateData: any = {
      status: CourseMasterStatus.ARCHIVED,
    };

    const course = await this.courseRepository.update(courseMasterId, unpublishUpdateData);

    await this.createAuditLog({
      userId: requester.sub,
      action: 'course-master.unpublish',
      entity: 'course-master',
      entityId: courseMasterId,
      description: `Unpublished course master (Archived): ${existing.title}`,
      oldValues: existing,
      newValues: course,
    });

    return await this.toCourseMasterResponseDTO(course);
  }

  /**
   * Reject a course master (set status to rejected and add rejection reason)
   */
  async reject(requester: Requester, courseMasterId: string, reason: string): Promise<CourseMasterResponseDTO> {
    if (!this.hasPermission(requester, 'course.publish')) {
      throw new ForbiddenException('Only authorized staff can reject course masters');
    }

    const existing = await this.courseRepository.findById(courseMasterId);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Course master with id ${courseMasterId} not found`);
    }

    const rejectUpdateData: any = {
      approvedBy: requester.sub, // Track who rejected it
      status: CourseMasterStatus.REJECTED,
      rejectionReason: reason,
    };

    const course = await this.courseRepository.update(courseMasterId, rejectUpdateData);

    await this.createAuditLog({
      userId: requester.sub,
      action: 'course-master.reject',
      entity: 'course-master',
      entityId: courseMasterId,
      description: `Rejected course master: ${existing.title}. Reason: ${reason}`,
      oldValues: existing,
      newValues: course,
      metadata: { reason }
    });

    return await this.toCourseMasterResponseDTO(course);
  }

  /**
   * Get course master curriculum (modules with lessons)
   */
  async getCurriculum(courseMasterId: string, requester?: Requester): Promise<{
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
    const userId = requester?.sub;
    // Verify course master exists
    const course = await this.courseRepository.findById(courseMasterId);
    if (!course || course.deletedAt) {
      throw new NotFoundException(`Course master with id ${courseMasterId} not found`);
    }

    // Check enrollment and instructor status if userId is provided
    let enrollment: any = null;
    let isInstructorForCourse = false;
    let isAdminOrStaff = false;

    if (requester) {
      isAdminOrStaff = this.hasPermission(requester, 'course.view_restricted') ||
        this.hasPermission(requester, 'course.publish') ||
        ['admin', 'staff'].includes(requester.role?.toLowerCase() || '');
    }

    // Resolve learner enrollment (based on CourseRun → CourseMaster linking)
    if (userId) {
      try {
        const [hasAccess, enrollmentRecord] = await Promise.all([
          this.enrollmentService.isEnrolled(userId, courseMasterId),
          this.enrollmentService.findByUserAndCourseMaster(userId, courseMasterId),
        ]);

        if (hasAccess) {
          enrollment = enrollmentRecord;
        }
      } catch {
        // Swallow enrollment errors here; curriculum is still readable for public preview lessons
      }
    }

    if (userId) {
      try {
        isInstructorForCourse = await this.isInstructor(userId, courseMasterId);
      } catch (error) { }
    }

    const showDraft = isInstructorForCourse || isAdminOrStaff;

    if (!showDraft) {
      // It's a student or a public user. We should serve from CourseVersion snapshot.
      let courseVersion: any = null;

      if (enrollment && enrollment.versionId) {
        // Enrolled user sees the version they enrolled in
        courseVersion = await this.courseRepository.getVersionById(enrollment.versionId);
      } else {
        // Not enrolled (or enrolled without version tracking), fetch latest published version
        courseVersion = await this.courseRepository.getLatestVersion(courseMasterId);
      }

      if (courseVersion && courseVersion.curriculumSnapshot) {
        return {
          modules: (courseVersion.curriculumSnapshot as any[]).map(mod => {
            const showAllVideoUrl = !!enrollment;
            return {
              id: mod.id,
              title: mod.title,
              description: mod.description || undefined,
              order: mod.orderIndex,
              durationMinutes: mod.durationMinutes || undefined,
              lessons: (mod.lessons || []).map((lesson: any) => {
                // User with valid enrollment can access all published lessons
                const isLessonPublished = !lesson.status || lesson.status === 'published';
                const canAccess = (lesson.isPreview || !!enrollment) && isLessonPublished;

                return {
                  id: lesson.id,
                  title: lesson.title,
                  contentType: lesson.contentType,
                  videoDuration: lesson.videoDuration || undefined,
                  videoUrl: (lesson.isPreview || showAllVideoUrl) ? (lesson.videoUrl || undefined) : undefined,
                  order: lesson.orderIndex,
                  isPreview: lesson.isPreview,
                  isUnlocked: canAccess,
                };
              }),
            };
          }),
        };
      }

      // No snapshot exists: learners/public see empty curriculum.
      // Instructors fall through to live tables below.
      return { modules: [] };
    }

    // Instructor path: Fetch from live/staging tables so they can preview draft content
    const modules = await this.moduleRepository.findByCourseId(courseMasterId);

    const isEnrolled = !!enrollment || isInstructorForCourse || isAdminOrStaff;

    const modulesWithLessons = await Promise.all(
      modules.map(async (module) => {
        const lessons = await this.lessonRepository.findByModuleId(module.id, true); // includeDrafts = true for instructors

        return {
          id: module.id,
          title: module.title,
          description: module.description || undefined,
          order: module.orderIndex,
          durationMinutes: module.durationMinutes || undefined,
          lessons: lessons.map((lesson) => {
            // User with valid enrollment can access all published lessons
            // Instructors/admins can see draft lessons too
            const isLessonPublished = !(lesson as any).status || (lesson as any).status === 'published';
            const isAccessible = lesson.isPreview || !!enrollment || isInstructorForCourse || isAdminOrStaff;
            const canAccess = isInstructorForCourse || isAdminOrStaff || (isAccessible && isLessonPublished);

            return {
              id: lesson.id,
              title: lesson.title,
              contentType: lesson.contentType,
              videoDuration: lesson.videoDuration || undefined,
              videoUrl: canAccess ? (lesson.videoUrl || undefined) : undefined,
              order: lesson.orderIndex,
              isPreview: lesson.isPreview,
              isUnlocked: canAccess,
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
   * Get course version history
   */
  async getVersionHistory(courseMasterId: string): Promise<Array<{
    id: string;
    versionTag: string;
    createdAt: Date;
    createdBy?: string;
    changelog?: string;
    totalModules?: number;
    totalLessons?: number;
  }>> {
    try {
      const versions = await this.courseRepository.getVersions(courseMasterId);
      return versions.map(v => ({
        id: v.id,
        versionTag: v.versionTag,
        createdAt: v.publishedAt, // Use publishedAt as createdAt
        createdBy: (v as any).createdBy,
        changelog: v.changelog || undefined,
        totalModules: (v.curriculumSnapshot as any[])?.length || 0,
        totalLessons: (v.curriculumSnapshot as any[])?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0,
      }));
    } catch (error: any) {
      this.logger.error(`Failed to get version history for course master ${courseMasterId}`, error);
      return [];
    }
  }

  /**
   * Check if a user is the lecturer for any course run belonging to this master
   */
  async isInstructor(userId: string, courseMasterId: string): Promise<boolean> {
    try {
      // Direct database check via CourseRun repository
      const count = await this.prisma.courseRun.count({
        where: {
          courseMasterId,
          lecturerId: userId,
        }
      });
      return count > 0;
    } catch (error) {
      this.logger.error(`Failed to check if user ${userId} is lecturer for course master ${courseMasterId}`, error);
      return false;
    }
  }

  /**
   * Validate if a course master is ready for scheduling
   */
  async validateForScheduling(courseMasterId: string): Promise<{ isReady: boolean; message?: string }> {
    try {
      const course = await this.courseRepository.findById(courseMasterId);
      if (!course || course.deletedAt) {
        return { isReady: false, message: 'Course master not found' };
      }

      // 1. Check status
      if (course.status !== 'published') {
        return { isReady: false, message: 'Course master must be published before scheduling' };
      }

      // 2. Check type
      if (course.type !== 'live') {
        return { isReady: false, message: 'Only live course masters can be scheduled' };
      }

      // 3. Check curriculum (minimum lessons)
      const lessonCount = await this.courseRepository.countLessons(courseMasterId);

      // Support short/specialized courses with a simple minimum lesson rule.
      // Detailed live configuration is now handled at CourseRun level.
      const minLessons = 1; // Default to 1 to allow short courses/workshops

      if (lessonCount < minLessons) {
        return {
          isReady: false,
          message: `Course master must have at least ${minLessons} lessons in curriculum (currently has ${lessonCount})`
        };
      }

      return { isReady: true };
    } catch (error: any) {
      this.logger.error(`Failed to validate course master ${courseMasterId} for scheduling`, error);
      return { isReady: false, message: 'Internal validation error' };
    }
  }

  async getStudentCount(courseMasterId: string): Promise<{ count: number }> {
    const existing = await this.courseRepository.findById(courseMasterId);
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Course master with id ${courseMasterId} not found`);
    }

    // Calculate total students from all courseRuns
    // This would need to be fetched from courseRuns or through enrollments
    // For now, return 0 as placeholder until enrollment data is aggregated
    return { count: 0 };
  }

  /**
   * Get a specific course version by ID
   */
  async getVersionById(versionId: string): Promise<any | null> {
    return this.courseRepository.getVersionById(versionId);
  }
}
