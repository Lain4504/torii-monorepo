import { Injectable, Logger, Inject, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { generateSlug } from '@server/shared';
import type { Course } from '@prisma/generated';
import { validate as uuidValidate } from 'uuid';

import { UserRole } from '@workspace/schemas';
import type {
  CourseCreateDTO,
  CourseUpdateDTO,
  CourseResponseDTO,
  PaginationOptionsDTO,
  PaginatedResponseDTO,
  Requester,
  CourseStatus,
} from '@workspace/schemas';

import type { ICourseService } from '../../interfaces/services';
import type { ICourseRepository } from '../../interfaces/repositories';
import { COURSE_REPOSITORY_TOKEN } from '../../interfaces/repositories';

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
    @Inject('NATS_SERVICE')
    private readonly natsClient: ClientProxy,
  ) { }

  /**
   * Map Course entity to CourseResponseDTO
   */
  private toCourseResponseDTO(course: Course): CourseResponseDTO {
    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      type: course.type as 'vod' | 'live',
      description: course.description || undefined,
      shortDescription: course.shortDescription || undefined,
      jlptLevel: course.jlptLevel as any,
      aiMetadata: (course.aiMetadata as any) || undefined,
      thumbnailUrl: course.thumbnailUrl || undefined,
      previewVideoUrl: course.previewVideoUrl || undefined,
      price: Number(course.price),
      discountPrice: course.discountPrice ? Number(course.discountPrice) : undefined,
      liveConfig: (course.liveConfig as any) || undefined,
      durationWeeks: course.durationWeeks || undefined,
      totalLessons: course.totalLessons,
      totalQuizzes: course.totalQuizzes,
      totalStudents: course.totalStudents,
      averageRating: Number(course.averageRating),
      totalReviews: course.totalReviews,
      status: course.status as any,
      featured: course.featured,
      isFree: course.isFree,
      tags: course.tags,
      learningOutcomes: course.learningOutcomes || undefined,
      requirements: course.requirements || undefined,
      createdBy: course.createdBy || undefined,
      approvedBy: course.approvedBy || undefined,
      approvedAt: course.approvedAt || undefined,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      deletedAt: course.deletedAt || undefined,
    };
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

  /**
   * Find all courses with pagination and search
   */
  async findAll(options: PaginationOptionsDTO): Promise<PaginatedResponseDTO<CourseResponseDTO>> {
    try {
      const { page = 1, limit = 10, search } = options;
      const skip = (page - 1) * limit;

      const where: any = {
        deletedAt: null,
      };

      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { shortDescription: { contains: search, mode: 'insensitive' } },
        ];
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

      // Prepare data for creation
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
        status: dto.status || 'draft',
        featured: dto.featured ?? false,
        isFree: dto.isFree ?? false,
        tags: dto.tags || [],
        learningOutcomes: dto.learningOutcomes || [],
        requirements: dto.requirements || [],
        createdBy: requester.sub,
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
      if (dto.featured !== undefined) updateData.featured = dto.featured;
      if (dto.isFree !== undefined) updateData.isFree = dto.isFree;
      if (dto.tags !== undefined) updateData.tags = dto.tags;
      if (dto.learningOutcomes !== undefined) updateData.learningOutcomes = dto.learningOutcomes;
      if (dto.requirements !== undefined) updateData.requirements = dto.requirements;

      // Handle status changes
      let isPublishing = false;
      if (dto.status !== undefined && dto.status !== existing.status) {
        updateData.status = dto.status;

        if (dto.status === 'published') {
          isPublishing = true;
          const validApprovedBy = dto.approvedBy && uuidValidate(dto.approvedBy)
            ? dto.approvedBy
            : requester.sub;
          updateData.approvedBy = validApprovedBy;
          updateData.approvedAt = new Date();
        }

        if (existing.status === 'published' && dto.status !== 'published') {
          updateData.approvedBy = null;
          updateData.approvedAt = null;
        }
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
   */
  async getFeatured(): Promise<CourseResponseDTO[]> {
    const courses = await this.courseRepository.findFeatured();
    return courses.map(course => this.toCourseResponseDTO(course));
  }

  /**
   * Get courses by type
   */
  async getByType(type: 'vod' | 'live'): Promise<CourseResponseDTO[]> {
    const courses = await this.courseRepository.findByType(type);
    return courses.map(course => this.toCourseResponseDTO(course));
  }

  /**
   * Publish a course
   */
  async publish(requester: Requester, courseId: string): Promise<CourseResponseDTO> {
    if (![UserRole.ADMIN, UserRole.LECTURER].includes(requester.role as UserRole)) {
      throw new ForbiddenException('Only admins and lecturers can publish courses');
    }

    return this.update(requester, courseId, {
      status: 'published' as CourseStatus,
      approvedBy: requester.sub,
    });
  }

  /**
   * Unpublish a course
   */
  async unpublish(requester: Requester, courseId: string): Promise<CourseResponseDTO> {
    if (![UserRole.ADMIN, UserRole.LECTURER].includes(requester.role as UserRole)) {
      throw new ForbiddenException('Only admins and lecturers can unpublish courses');
    }

    return this.update(requester, courseId, { status: 'draft' as CourseStatus });
  }
}
