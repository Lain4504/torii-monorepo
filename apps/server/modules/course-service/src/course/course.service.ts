import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '@server/shared';
import { Course, Prisma } from '@prisma/generated';
import { PaginatedResponseDto } from '@workspace/dtos';

import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseQueryDto,
  UpdateCourseStatusDto,
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
        const baseSlug = this.generateSlug(input.title);
        slug = await this.ensureUniqueSlug(baseSlug);
      }

      // Prepare update data
      const updateData: Prisma.CourseUpdateInput = {
        ...(input.title && { title: input.title, slug }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.shortDescription !== undefined && {
          shortDescription: input.shortDescription,
        }),
        ...(input.jlptLevel && { jlptLevel: input.jlptLevel }),
        ...(input.thumbnailUrl !== undefined && {
          thumbnailUrl: input.thumbnailUrl,
        }),
        ...(input.previewVideoUrl !== undefined && {
          previewVideoUrl: input.previewVideoUrl,
        }),
        ...(input.price !== undefined && { price: input.price }),
        ...(input.discountPrice !== undefined && {
          discountPrice: input.discountPrice,
        }),
        ...(input.durationWeeks !== undefined && {
          durationWeeks: input.durationWeeks,
        }),
        ...(input.status && { status: input.status }),
        ...(input.featured !== undefined && { featured: input.featured }),
        ...(input.isFree !== undefined && { isFree: input.isFree }),
        ...(input.tags !== undefined && { tags: input.tags }),
        ...(input.learningOutcomes !== undefined && {
          learningOutcomes: input.learningOutcomes,
        }),
        ...(input.requirements !== undefined && {
          requirements: input.requirements,
        }),
      };

      const course = await this.prisma.course.update({
        where: { id },
        data: updateData,
      });

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

  async updateStatus(
    id: string,
    input: UpdateCourseStatusDto,
  ): Promise<Course> {
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
      const updateData: Prisma.CourseUpdateInput = {
        status: input.status,
      };

      // If status is being changed to published, set approvedBy and approvedAt
      if (input.status === CourseStatus.PUBLISHED) {
        updateData.approvedBy = input.approvedBy || null;
        updateData.approvedAt = input.approvedBy ? new Date() : null;
      }

      const course = await this.prisma.course.update({
        where: { id },
        data: updateData,
      });

      return course;
    } catch (error: any) {
      throw new RpcException({
        status: 400,
        message: `Failed to update course status: ${error?.message || 'Unknown error'}`,
      });
    }
  }
}
