import { Injectable, Logger, Inject } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService, generateSlug } from '@server/shared';
import { Course } from '@prisma/generated';
import { validate as uuidValidate } from 'uuid';

import {
  type CourseCreateDTO,
  type CourseUpdateDTO,
  type CourseQueryDTO,
  type CourseResponseDTO,
  type PaginatedResponse,
  CourseStatus,
} from '@workspace/schemas';

@Injectable()
export class CourseService {
  private readonly logger = new Logger(CourseService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) { }

  /**
   * Map Course entity to CourseResponseDto
   */
  private toCourseResponseDto(course: Course): CourseResponseDTO {
    return {
      id: course.id,
      title: course.title,
      slug: course.slug,
      description: course.description || undefined,
      shortDescription: course.shortDescription || undefined,
      jlptLevel: course.jlptLevel as any,
      thumbnailUrl: course.thumbnailUrl || undefined,
      previewVideoUrl: course.previewVideoUrl || undefined,
      price: Number(course.price),
      discountPrice: course.discountPrice ? Number(course.discountPrice) : undefined,
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
  private async ensureUniqueSlug(baseSlug: string): Promise<string> {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    let slug = `${baseSlug}-${dateStr}`;

    const existing = await this.prisma.course.findUnique({
      where: { slug },
    });

    if (!existing) {
      return slug;
    }

    // If slug exists, append timestamp to ensure uniqueness
    const timestamp = Date.now();
    return `${baseSlug}-${dateStr}-${timestamp}`;
  }

  async findAll(
    query: CourseQueryDTO,
  ): Promise<PaginatedResponse<CourseResponseDTO>> {
    try {
      const { page, limit, jlptLevel, status, search, featured } = query;

      // Parse pagination params to numbers (query params are strings)
      const pageNum = parseInt(String(page || 1), 10);
      const limitNum = parseInt(String(limit || 10), 10);
      const skip = (pageNum - 1) * limitNum;

      const whereClause: Record<string, any> = {
        deletedAt: null, // Exclude soft-deleted courses
      };

      if (jlptLevel) {
        whereClause.jlptLevel = jlptLevel;
      }

      if (status) {
        whereClause.status = status;
      }

      if (featured !== undefined) {
        whereClause.featured = featured;
      }

      if (search) {
        whereClause.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { shortDescription: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [total, courses] = await Promise.all([
        this.prisma.course.count({ where: whereClause }),
        this.prisma.course.findMany({
          take: limitNum,
          skip: skip,
          where: whereClause,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      const totalPages = Math.ceil(total / limitNum);

      return {
        data: courses.map(course => this.toCourseResponseDto(course)),
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
      };
    } catch (error: any) {
      this.logger.error('Failed to retrieve courses', error);
      const pageNum = parseInt(String(query.page), 10) || 1;
      const limitNum = parseInt(String(query.limit), 10) || 10;
      return {
        data: [],
        total: 0,
        page: pageNum,
        limit: limitNum,
        totalPages: 0,
      };
    }
  }

  async findOne(id: string): Promise<CourseResponseDTO | null> {
    const course = await this.prisma.course.findFirst({
      where: {
        id,
        deletedAt: null, // Exclude soft-deleted courses
      },
    });

    return course ? this.toCourseResponseDto(course) : null;
  }

  async findBySlug(slug: string): Promise<CourseResponseDTO | null> {
    const course = await this.prisma.course.findFirst({
      where: {
        slug,
        deletedAt: null, // Exclude soft-deleted courses
      },
    });

    return course ? this.toCourseResponseDto(course) : null;
  }

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
    const modules = await this.prisma.module.findMany({
      where: {
        courseId,
        deletedAt: null,
      },
      include: {
        lessons: {
          where: {
            deletedAt: null,
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        order: 'asc',
      },
    });

    return {
      modules: modules.map(module => {
        // Calculate total duration for module from lessons' videoDuration
        const totalDurationSeconds = module.lessons.reduce((sum, lesson) => {
          return sum + (lesson.videoDuration || 0);
        }, 0);
        const durationMinutes = totalDurationSeconds > 0 
          ? Math.round(totalDurationSeconds / 60) 
          : (module.durationMinutes || undefined);

        return {
          id: module.id,
          title: module.title,
          description: module.description || undefined,
          order: module.order,
          durationMinutes,
          lessons: module.lessons.map(lesson => ({
            id: lesson.id,
            title: lesson.title,
            contentType: lesson.contentType,
            videoDuration: lesson.videoDuration || undefined,
            order: lesson.order,
            isPreview: lesson.isPreview,
            isUnlocked: lesson.isUnlocked,
          })),
        };
      }),
    };
  }

  async create(input: CourseCreateDTO): Promise<CourseResponseDTO> {
    try {
      // Generate slug from title
      const baseSlug = generateSlug(input.title);
      const slug = await this.ensureUniqueSlug(baseSlug);

      // Prepare data for creation
      const data = {
        title: input.title,
        slug,
        description: input.description || null,
        shortDescription: input.shortDescription || null,
        jlptLevel: input.jlptLevel,
        thumbnailUrl: input.thumbnailUrl || null,
        previewVideoUrl: input.previewVideoUrl || null,
        price: input.price,
        discountPrice: input.discountPrice || null,
        durationWeeks: input.durationWeeks || null,
        status: input.status || CourseStatus.DRAFT,
        featured: input.featured ?? false,
        isFree: input.isFree ?? false,
        tags: input.tags || [],
        learningOutcomes: input.learningOutcomes || [],
        requirements: input.requirements || [],
        createdBy: input.createdBy || null,
      };

      const course = await this.prisma.course.create({ data });

      return this.toCourseResponseDto(course);
    } catch (error: any) {
      this.logger.error('Error creating course', error);
      throw new RpcException({
        status: 400,
        message: `Failed to create course: ${error?.message || 'Unknown error'}`,
      });
    }
  }

  async update(id: string, input: CourseUpdateDTO): Promise<CourseResponseDTO> {
    // Check if course exists and not deleted
    const existing = await this.prisma.course.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new RpcException({
        status: 404,
        message: `Course with id ${id} not found`,
      });
    }

    try {
      // If title is being updated, regenerate slug
      let slug = existing.slug;
      if (input.title && input.title !== existing.title) {
        const baseSlug = generateSlug(input.title);
        slug = await this.ensureUniqueSlug(baseSlug);
      }

      // Prepare update data - only update fields that are provided AND different from existing values
      const updateData: Record<string, any> = {};

      // Title: only update if provided and different from existing
      if (input.title !== undefined && input.title !== existing.title) {
        updateData.title = input.title;
        updateData.slug = slug;
      }

      // Description: only update if provided and different from existing
      if (input.description !== undefined) {
        const existingDesc = existing.description || null;
        const newDesc = input.description || null;
        if (existingDesc !== newDesc) {
          updateData.description = input.description;
        }
      }

      // ShortDescription: only update if provided and different from existing
      if (input.shortDescription !== undefined) {
        const existingShortDesc = existing.shortDescription || null;
        const newShortDesc = input.shortDescription || null;
        if (existingShortDesc !== newShortDesc) {
          updateData.shortDescription = input.shortDescription;
        }
      }

      // JlptLevel: only update if provided and different from existing
      if (input.jlptLevel !== undefined && input.jlptLevel !== existing.jlptLevel) {
        updateData.jlptLevel = input.jlptLevel;
      }

      // ThumbnailUrl: only update if provided and different from existing
      if (input.thumbnailUrl !== undefined) {
        const existingThumb = existing.thumbnailUrl || null;
        const newThumb = input.thumbnailUrl || null;
        if (existingThumb !== newThumb) {
          updateData.thumbnailUrl = input.thumbnailUrl;
        }
      }

      // PreviewVideoUrl: only update if provided and different from existing
      if (input.previewVideoUrl !== undefined) {
        const existingPreview = existing.previewVideoUrl || null;
        const newPreview = input.previewVideoUrl || null;
        if (existingPreview !== newPreview) {
          updateData.previewVideoUrl = input.previewVideoUrl;
        }
      }

      // Price: only update if provided and different from existing
      if (input.price !== undefined) {
        const existingPrice = Number(existing.price);
        const newPrice = Number(input.price);
        if (existingPrice !== newPrice) {
          updateData.price = input.price;
        }
      }

      // DiscountPrice: only update if provided and different from existing
      if (input.discountPrice !== undefined) {
        const existingDiscount = existing.discountPrice ? Number(existing.discountPrice) : null;
        const newDiscount = input.discountPrice ? Number(input.discountPrice) : null;
        if (existingDiscount !== newDiscount) {
          updateData.discountPrice = input.discountPrice;
        }
      }

      // DurationWeeks: only update if provided and different from existing
      if (input.durationWeeks !== undefined) {
        const existingDuration = existing.durationWeeks || null;
        const newDuration = input.durationWeeks || null;
        if (existingDuration !== newDuration) {
          updateData.durationWeeks = input.durationWeeks;
        }
      }

      // Status: only update if provided and different from existing
      let isPublishingCourse = false;
      if (input.status !== undefined && input.status !== existing.status) {
        updateData.status = input.status;

        // If status is being changed to published, set approvedBy and approvedAt
        if (input.status === CourseStatus.PUBLISHED) {
          isPublishingCourse = true;
          // Only set approvedBy if it's a valid UUID format
          const validApprovedBy = input.approvedBy &&
            typeof input.approvedBy === 'string' &&
            uuidValidate(input.approvedBy.trim())
            ? input.approvedBy.trim()
            : null;
          updateData.approvedBy = validApprovedBy;
          updateData.approvedAt = validApprovedBy ? new Date() : null;
        }

        // If status is being changed from published to something else, clear approval
        if (existing.status === CourseStatus.PUBLISHED && input.status !== CourseStatus.PUBLISHED) {
          updateData.approvedBy = null;
          updateData.approvedAt = null;
        }
      }

      // Featured: only update if provided and different from existing
      if (input.featured !== undefined && input.featured !== existing.featured) {
        updateData.featured = input.featured;
      }

      // IsFree: only update if provided and different from existing
      if (input.isFree !== undefined && input.isFree !== existing.isFree) {
        updateData.isFree = input.isFree;
      }

      // Tags: only update if provided and different from existing
      if (input.tags !== undefined) {
        const existingTags = existing.tags || [];
        const newTags = input.tags || [];
        const tagsChanged = existingTags.length !== newTags.length ||
          existingTags.some((tag, index) => tag !== newTags[index]);
        if (tagsChanged) {
          updateData.tags = input.tags;
        }
      }

      // LearningOutcomes: only update if provided and different from existing
      if (input.learningOutcomes !== undefined) {
        const existingOutcomes = JSON.stringify(existing.learningOutcomes || {});
        const newOutcomes = JSON.stringify(input.learningOutcomes || {});
        if (existingOutcomes !== newOutcomes) {
          updateData.learningOutcomes = input.learningOutcomes;
        }
      }

      // Requirements: only update if provided and different from existing
      if (input.requirements !== undefined) {
        const existingReqs = JSON.stringify(existing.requirements || {});
        const newReqs = JSON.stringify(input.requirements || {});
        if (existingReqs !== newReqs) {
          updateData.requirements = input.requirements;
        }
      }

      // Check if there's anything to update
      if (Object.keys(updateData).length === 0) {
        // No changes, return existing course
        return this.toCourseResponseDto(existing);
      }

      const course = await this.prisma.course.update({
        where: { id },
        data: updateData,
      });

      // Emit event if course is being published
      if (isPublishingCourse) {
        try {
          this.logger.log(`Course ${course.id} published, emitting course.published event`);

          // For testing: Use MOCK_USER_ID to send notification
          // In production, this should be replaced with actual interested users (from wishlist, etc.)
          const MOCK_USER_ID = '5e808603-1e54-4dc9-ae93-f1e347c101ab';

          this.natsClient.emit(
            { cmd: 'course.published' },
            {
              courseId: course.id,
              courseTitle: course.title,
              courseJlptLevel: course.jlptLevel,
              userIds: [MOCK_USER_ID], // Send notification to MOCK_USER_ID for testing
            },
          );
          this.logger.log(`Successfully emitted course.published event for course: ${course.id} with userIds: [${MOCK_USER_ID}]`);
        } catch (error: any) {
          // Log error but don't fail the update
          this.logger.error(`Failed to emit course.published event: ${error?.message}`, error);
        }
      }

      return this.toCourseResponseDto(course);
    } catch (error: any) {
      this.logger.error('Error updating course', error);
      throw new RpcException({
        status: 400,
        message: `Failed to update course: ${error?.message || 'Unknown error'}`,
      });
    }
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.prisma.course.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existing) {
      throw new RpcException({
        status: 404,
        message: `Course with id ${id} not found`,
      });
    }

    try {
      // Soft delete
      await this.prisma.course.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return true;
    } catch (error: any) {
      throw new RpcException({
        status: 400,
        message: `Failed to delete course: ${error?.message || 'Unknown error'}`,
      });
    }
  }

  async restore(id: string): Promise<CourseResponseDTO> {
    // Check if course exists (including soft-deleted ones)
    const existing = await this.prisma.course.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new RpcException({
        status: 404,
        message: `Course with id ${id} not found`,
      });
    }

    if (!existing.deletedAt) {
      throw new RpcException({
        status: 400,
        message: `Course with id ${id} is not deleted`,
      });
    }

    try {
      const course = await this.prisma.course.update({
        where: { id },
        data: { deletedAt: null },
      });

      return this.toCourseResponseDto(course);
    } catch (error: any) {
      this.logger.error('Error restoring course', error);
      throw new RpcException({
        status: 400,
        message: `Failed to restore course: ${error?.message || 'Unknown error'}`,
      });
    }
  }
}
