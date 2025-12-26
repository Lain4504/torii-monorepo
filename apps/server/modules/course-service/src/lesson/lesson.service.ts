import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '@server/shared';
import { Lesson } from '@prisma/generated';
import { PaginatedResponseDto, LessonResponseDto } from '@workspace/dtos';
import { LessonQueryDto, CreateLessonDto, UpdateLessonDto } from '@workspace/dtos';

@Injectable()
export class LessonService {
  private readonly logger = new Logger(LessonService.name);

  constructor(private readonly prisma: PrismaService) {}

  private toLessonResponseDto(lesson: Lesson): LessonResponseDto {
    return {
      id: lesson.id,
      moduleId: lesson.moduleId,
      title: lesson.title,
      contentType: lesson.contentType as any,
      videoUrl: lesson.videoUrl || undefined,
      videoDuration: lesson.videoDuration || undefined,
      articleContent: lesson.articleContent || undefined,
      order: lesson.order,
      isPreview: lesson.isPreview,
      isUnlocked: lesson.isUnlocked,
      createdBy: lesson.createdBy || undefined,
      createdAt: lesson.createdAt,
      updatedAt: lesson.updatedAt,
      deletedAt: lesson.deletedAt || undefined,
    };
  }

  async findAll(query: LessonQueryDto): Promise<PaginatedResponseDto<LessonResponseDto>> {
    try {
      const { page = 1, limit = 10, moduleId, contentType, search } = query;
      const skip = (page - 1) * limit;

      const whereClause: Record<string, any> = { deletedAt: null };

      if (moduleId) whereClause.moduleId = moduleId;
      if (contentType) whereClause.contentType = contentType;

      if (search) {
        whereClause.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { articleContent: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [total, lessons] = await Promise.all([
        this.prisma.lesson.count({ where: whereClause }),
        this.prisma.lesson.findMany({
          take: limit,
          skip,
          where: whereClause,
          orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: `${lessons.length} lesson(s) retrieved successfully`,
        error: '',
        data: lessons.map(l => this.toLessonResponseDto(l)),
        meta: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    } catch (error: any) {
      this.logger.error('Failed to retrieve lessons', error);
      return {
        success: false,
        message: 'Failed to retrieve lessons',
        error: error?.message || 'Unknown error',
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

  async findOne(id: string): Promise<LessonResponseDto | null> {
    const lesson = await this.prisma.lesson.findFirst({ where: { id, deletedAt: null } });
    return lesson ? this.toLessonResponseDto(lesson) : null;
  }

  async create(input: CreateLessonDto): Promise<LessonResponseDto> {
    try {
      // Validate module exists
      const module = await this.prisma.module.findFirst({ where: { id: input.moduleId, deletedAt: null } });
      if (!module) {
        throw new RpcException({ status: 400, message: `Module ${input.moduleId} not found` });
      }

      // If order not provided, set to max order + 1
      let order = input.order ?? null;
      if (order === null || order === undefined) {
        const maxOrder = await this.prisma.lesson.aggregate({ _max: { order: true }, where: { moduleId: input.moduleId } });
        order = (maxOrder._max.order ?? 0) + 1;
      }

      const data = {
        moduleId: input.moduleId,
        title: input.title,
        contentType: input.contentType,
        videoUrl: input.videoUrl || null,
        videoDuration: input.videoDuration || null,
        articleContent: input.articleContent || null,
        order: order,
        isPreview: input.isPreview ?? false,
        isUnlocked: input.isUnlocked ?? true,
        createdBy: input.createdBy || null,
      } as any;

      const created = await this.prisma.lesson.create({ data });
      return this.toLessonResponseDto(created);
    } catch (error: any) {
      this.logger.error('Error creating lesson', error);
      throw new RpcException({ status: 400, message: error?.message || 'Failed to create lesson' });
    }
  }

  async update(id: string, input: UpdateLessonDto): Promise<LessonResponseDto> {
    const existing = await this.prisma.lesson.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      throw new RpcException({ status: 404, message: `Lesson ${id} not found` });
    }

    try {
      const updateData: Record<string, any> = {};
      if (input.moduleId && input.moduleId !== existing.moduleId) updateData.moduleId = input.moduleId;
      if (input.title !== undefined && input.title !== existing.title) updateData.title = input.title;
      if (input.contentType !== undefined && input.contentType !== existing.contentType) updateData.contentType = input.contentType;
      if (input.videoUrl !== undefined) updateData.videoUrl = input.videoUrl ?? null;
      if (input.videoDuration !== undefined) updateData.videoDuration = input.videoDuration ?? null;
      if (input.articleContent !== undefined) updateData.articleContent = input.articleContent ?? null;
      if (input.order !== undefined) updateData.order = input.order;
      if (input.isPreview !== undefined) updateData.isPreview = input.isPreview;
      if (input.isUnlocked !== undefined) updateData.isUnlocked = input.isUnlocked;

      if (Object.keys(updateData).length === 0) return this.toLessonResponseDto(existing);

      const updated = await this.prisma.lesson.update({ where: { id }, data: updateData });
      return this.toLessonResponseDto(updated);
    } catch (error: any) {
      this.logger.error('Error updating lesson', error);
      throw new RpcException({ status: 400, message: error?.message || 'Failed to update lesson' });
    }
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.prisma.lesson.findFirst({ where: { id, deletedAt: null } });
    if (!existing) {
      throw new RpcException({ status: 404, message: `Lesson ${id} not found` });
    }

    await this.prisma.lesson.update({ where: { id }, data: { deletedAt: new Date() } });
    return true;
  }

  async restore(id: string): Promise<LessonResponseDto> {
    const existing = await this.prisma.lesson.findFirst({ where: { id } });
    if (!existing) {
      throw new RpcException({ status: 404, message: `Lesson ${id} not found` });
    }

    const restored = await this.prisma.lesson.update({ where: { id }, data: { deletedAt: null } });
    return this.toLessonResponseDto(restored);
  }
}
