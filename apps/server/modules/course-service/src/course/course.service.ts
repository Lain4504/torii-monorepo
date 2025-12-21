import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '@server/shared';
import { Course, Prisma } from '@prisma/generated';
import { PaginatedResponseDto } from '@workspace/dtos';

import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseQueryDto,
  CourseStatus,
} from './course.dto';

@Injectable()
export class CourseService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generate URL-friendly slug from title
   */
  private generateSlug(title: string): string {
    if (!title || typeof title !== 'string') {
      throw new Error('Title is required and must be a string');
    }
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric with hyphen
      .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
      .substring(0, 255); // Ensure max length
  }

  /**
   * Ensure unique slug by appending number if needed
   */
  private async ensureUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await this.prisma.course.findUnique({
        where: { slug },
      });

      if (!existing) {
        return slug;
      }

      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  async findAll(
    query: CourseQueryDto,
  ): Promise<PaginatedResponseDto<Course>> {
    try {
      const { page = 1, limit = 10, jlptLevel, status, search, featured } =
        query;
      const skip = (page - 1) * limit;

      const whereClause: Prisma.CourseWhereInput = {
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
          take: limit,
          skip: skip,
          where: whereClause,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: `${courses.length} course(s) retrieved successfully`,
        error: '',
        data: courses,
        meta: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to retrieve courses',
        error: error.message,
        data: [],
        meta: {
          page: query.page || 1,
          limit: query.limit || 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    }
  }

  async findOne(id: string): Promise<Course | null> {
    const course = await this.prisma.course.findFirst({
      where: {
        id,
        deletedAt: null, // Exclude soft-deleted courses
      },
    });

    return course;
  }

  async create(input: CreateCourseDto): Promise<Course> {
    try {
      // Validate required fields
      if (!input || !input.title) {
        throw new RpcException({
          status: 400,
          message: 'Title is required',
        });
      }

      if (!input.jlptLevel) {
        throw new RpcException({
          status: 400,
          message: 'JLPT level is required',
        });
      }

      if (input.price === undefined || input.price === null) {
        throw new RpcException({
          status: 400,
          message: 'Price is required',
        });
      }

      // Log input for debugging
      console.log('Creating course with input:', JSON.stringify(input, null, 2));

      // Generate slug from title
      const baseSlug = this.generateSlug(input.title);
      const slug = await this.ensureUniqueSlug(baseSlug);

      // Prepare data for creation
      const data: Prisma.CourseCreateInput = {
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

      return course;
    } catch (error: any) {
      if (error?.code === 'P2002') {
        // Unique constraint violation
        throw new RpcException({
          status: 409,
          message: 'Course with this slug already exists',
        });
      }
      // Log the full error for debugging
      console.error('Error creating course:', error);
      throw new RpcException({
        status: 400,
        message: `Failed to create course: ${error?.message || 'Unknown error'}`,
      });
    }
  }

  async update(id: string, input: UpdateCourseDto): Promise<Course> {
    console.log('=== UPDATE COURSE ===');
    console.log('Course ID:', id);
    console.log('Input data:', JSON.stringify(input, null, 2));

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

    console.log('Existing course:', JSON.stringify(existing, null, 2));

    try {
      // If title is being updated, regenerate slug
      let slug = existing.slug;
      if (input.title && input.title !== existing.title) {
        const baseSlug = this.generateSlug(input.title);
        slug = await this.ensureUniqueSlug(baseSlug);
      }

      // Prepare update data - only update fields that are provided AND different from existing values
      // This prevents updating fields that are just default values from Swagger UI
      // Helper function to check if a value looks like a Swagger default value
      // Swagger UI often pre-fills with defaults: "string" for strings, 0 for numbers, ["string"] for arrays, {} for objects
      const isSwaggerDefaultValue = (value: any): boolean => {
        if (value === undefined || value === null) return false;
        if (typeof value === 'string') return value === 'string';
        if (typeof value === 'number') return value === 0;
        if (Array.isArray(value)) return value.length === 1 && value[0] === 'string';
        if (typeof value === 'object') return Object.keys(value).length === 0;
        return false;
      };
      
      const updateData: Prisma.CourseUpdateInput = {};
      
      // Title: only update if provided, different from existing, and not a Swagger default ("string")
      if (input.title !== undefined && input.title !== existing.title) {
        // Don't update if it's a Swagger default value ("string") and existing value is different
        if (!isSwaggerDefaultValue(input.title) || existing.title === 'string') {
          updateData.title = input.title;
          updateData.slug = slug;
        }
      }
      
      // Description: only update if provided, different from existing, and not a Swagger default
      if (input.description !== undefined) {
        const existingDesc = existing.description || null;
        const newDesc = input.description || null;
        // Only update if different AND not a Swagger default value being applied to existing non-default value
        if (existingDesc !== newDesc && !(isSwaggerDefaultValue(input.description) && existingDesc !== null && existingDesc !== '')) {
          updateData.description = input.description;
        }
      }
      
      // ShortDescription: only update if provided, different from existing, and not a Swagger default
      if (input.shortDescription !== undefined) {
        const existingShortDesc = existing.shortDescription || null;
        const newShortDesc = input.shortDescription || null;
        if (existingShortDesc !== newShortDesc && !(isSwaggerDefaultValue(input.shortDescription) && existingShortDesc !== null && existingShortDesc !== '')) {
          updateData.shortDescription = input.shortDescription;
        }
      }
      
      // JlptLevel: only update if provided and different from existing
      if (input.jlptLevel !== undefined && input.jlptLevel !== existing.jlptLevel) {
        updateData.jlptLevel = input.jlptLevel;
      }
      
      // ThumbnailUrl: only update if provided, different from existing, and not a Swagger default
      if (input.thumbnailUrl !== undefined) {
        const existingThumb = existing.thumbnailUrl || null;
        const newThumb = input.thumbnailUrl || null;
        if (existingThumb !== newThumb && !(isSwaggerDefaultValue(input.thumbnailUrl) && existingThumb !== null && existingThumb !== '')) {
          updateData.thumbnailUrl = input.thumbnailUrl;
        }
      }
      
      // PreviewVideoUrl: only update if provided, different from existing, and not a Swagger default
      if (input.previewVideoUrl !== undefined) {
        const existingPreview = existing.previewVideoUrl || null;
        const newPreview = input.previewVideoUrl || null;
        if (existingPreview !== newPreview && !(isSwaggerDefaultValue(input.previewVideoUrl) && existingPreview !== null && existingPreview !== '')) {
          updateData.previewVideoUrl = input.previewVideoUrl;
        }
      }
      
      // Price: only update if provided, different from existing, and not a Swagger default (0)
      if (input.price !== undefined) {
        const existingPrice = Number(existing.price);
        const newPrice = Number(input.price);
        if (existingPrice !== newPrice && !(newPrice === 0 && existingPrice !== 0)) {
          updateData.price = input.price;
        }
      }
      
      // DiscountPrice: only update if provided and different from existing (allow null, but ignore Swagger default 0)
      if (input.discountPrice !== undefined) {
        const existingDiscount = existing.discountPrice ? Number(existing.discountPrice) : null;
        const newDiscount = input.discountPrice ? Number(input.discountPrice) : null;
        if (existingDiscount !== newDiscount && !(newDiscount === 0 && existingDiscount !== null && existingDiscount !== 0)) {
          updateData.discountPrice = input.discountPrice;
        }
      }
      
      // DurationWeeks: only update if provided, different from existing, and not a Swagger default (0)
      if (input.durationWeeks !== undefined) {
        const existingDuration = existing.durationWeeks || null;
        const newDuration = input.durationWeeks || null;
        if (existingDuration !== newDuration && !(newDuration === 0 && existingDuration !== null && existingDuration !== 0)) {
          updateData.durationWeeks = input.durationWeeks;
        }
      }
      
      // Status: only update if provided and different from existing
      if (input.status !== undefined && input.status !== existing.status) {
        updateData.status = input.status;
        
        // If status is being changed to published, set approvedBy and approvedAt
        if (input.status === CourseStatus.PUBLISHED) {
          // Only set approvedBy if it's a valid UUID format
          // UUID format: 8-4-4-4-12 hexadecimal digits
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          const validApprovedBy = input.approvedBy && 
            typeof input.approvedBy === 'string' && 
            uuidRegex.test(input.approvedBy.trim())
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
      
      // Tags: only update if provided, different from existing, and not a Swagger default (["string"])
      if (input.tags !== undefined) {
        const existingTags = existing.tags || [];
        const newTags = input.tags || [];
        const tagsChanged = existingTags.length !== newTags.length ||
          existingTags.some((tag, index) => tag !== newTags[index]);
        const isDefaultTagArray = isSwaggerDefaultValue(input.tags);
        if (tagsChanged && !(isDefaultTagArray && existingTags.length > 0 && !isSwaggerDefaultValue(existingTags))) {
          updateData.tags = input.tags;
        }
      }
      
      // LearningOutcomes: only update if provided, different from existing, and not a Swagger default ({})
      if (input.learningOutcomes !== undefined) {
        const existingOutcomes = JSON.stringify(existing.learningOutcomes || {});
        const newOutcomes = JSON.stringify(input.learningOutcomes || {});
        const isDefaultObject = isSwaggerDefaultValue(input.learningOutcomes);
        if (existingOutcomes !== newOutcomes && !(isDefaultObject && existingOutcomes !== '{}' && existingOutcomes !== 'null')) {
          updateData.learningOutcomes = input.learningOutcomes;
        }
      }
      
      // Requirements: only update if provided, different from existing, and not a Swagger default ({})
      if (input.requirements !== undefined) {
        const existingReqs = JSON.stringify(existing.requirements || {});
        const newReqs = JSON.stringify(input.requirements || {});
        const isDefaultObject = isSwaggerDefaultValue(input.requirements);
        if (existingReqs !== newReqs && !(isDefaultObject && existingReqs !== '{}' && existingReqs !== 'null')) {
          updateData.requirements = input.requirements;
        }
      }

      // Check if there's anything to update
      if (Object.keys(updateData).length === 0) {
        // No changes, return existing course
        return existing;
      }

      console.log('Update data to be applied:', JSON.stringify(updateData, null, 2));
      console.log('Number of fields to update:', Object.keys(updateData).length);

      const course = await this.prisma.course.update({
        where: { id },
        data: updateData,
      });

      console.log('Course after update:', JSON.stringify(course, null, 2));
      console.log('=== UPDATE COMPLETE ===');

      return course;
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new RpcException({
          status: 409,
          message: 'Course with this slug already exists',
        });
      }
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

  async restore(id: string): Promise<Course> {
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

      console.log('Course restored successfully:', course.id);

      return course;
    } catch (error: any) {
      throw new RpcException({
        status: 400,
        message: `Failed to restore course: ${error?.message || 'Unknown error'}`,
      });
    }
  }
}
