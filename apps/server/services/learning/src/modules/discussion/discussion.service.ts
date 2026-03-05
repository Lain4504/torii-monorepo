import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { PrismaService } from '@server/shared';
import { DiscussionRepository } from '@server/learning/modules/discussion/discussion.repository';
import type {
  DiscussionTopicCreateDTO,
  DiscussionTopicQueryDTO,
  DiscussionTopicResponseDTO,
  DiscussionTopicPaginatedResponse,
  DiscussionTopicUpdateDTO,
} from '@workspace/schemas';
import {
  DiscussionTopicCategory,
  DiscussionTopicStatus,
} from '@workspace/schemas';
import { Prisma } from '@prisma/generated';

// No longer need aliases
type DiscussionCreateDTO = DiscussionTopicCreateDTO;
type DiscussionQueryDTO = DiscussionTopicQueryDTO;

@Injectable()
export class DiscussionService {
  private readonly logger = new Logger(DiscussionService.name);

  constructor(
    private readonly discussionRepository: DiscussionRepository,
    private readonly prisma: PrismaService,
    @InjectMapper() private readonly mapper: Mapper,
  ) {}

  async createDiscussion(
    userId: string,
    dto: DiscussionCreateDTO,
  ): Promise<DiscussionTopicResponseDTO> {
    // Validate Course Run Exists
    if (!dto.courseRunId) {
      throw new NotFoundException('Course Run ID is required for discussion');
    }

    const discussion = await this.discussionRepository.create({
      title: dto.title,
      content: dto.content,
      isPinned: dto.isPinned || false,
      isLocked: dto.isLocked || false,
      category: (dto as any).category || DiscussionTopicCategory.GENERAL,
      status: (dto as any).status || DiscussionTopicStatus.OPEN,
      courseRun: { connect: { id: dto.courseRunId } },
      author: { connect: { id: userId } },
      ...(dto.moduleId ? { moduleId: dto.moduleId } : {}),
      ...(dto.lessonId ? { lessonId: dto.lessonId } : {}),
    });

    const created = await this.discussionRepository.findById(discussion.id);
    return this.mapper.map<any, DiscussionTopicResponseDTO>(
      created!,
      'DiscussionTopic',
      'DiscussionTopicResponseDTO',
    );
  }

  async findAllDiscussions(
    query: DiscussionQueryDTO,
    currentUserId?: string,
  ): Promise<DiscussionTopicPaginatedResponse> {
    const page =
      typeof query.page === 'string'
        ? parseInt(query.page, 10)
        : query.page || 1;
    const limit =
      typeof query.limit === 'string'
        ? parseInt(query.limit, 10)
        : query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.DiscussionTopicWhereInput = {};

    if (query.courseRunId) {
      where.courseRunId = query.courseRunId;
    }
    if (query.moduleId) {
      where.moduleId = query.moduleId;
    }
    if (query.lessonId) {
      where.lessonId = query.lessonId;
    }
    if ((query as any).category) {
      where.category = (query as any).category;
    }
    if ((query as any).status) {
      where.status = (query as any).status;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.authorId) {
      where.authorId = query.authorId;
    }

    const orderBy: Prisma.DiscussionTopicOrderByWithRelationInput = {};

    const sortParams: Prisma.DiscussionTopicOrderByWithRelationInput[] = [
      { isPinned: 'desc' },
    ];

    if (query.sortBy === 'commentCount') {
      sortParams.push({ commentCount: query.sortOrder || 'desc' });
    } else if (query.sortBy === 'viewCount') {
      sortParams.push({ viewCount: query.sortOrder || 'desc' });
    } else {
      sortParams.push({ createdAt: 'desc' });
    }

    const [items, total] = await Promise.all([
      // @ts-ignore - Prisma orderBy accepts array
      this.discussionRepository.findAll({
        skip,
        take: limit,
        where,
        orderBy: sortParams,
      }),
      this.discussionRepository.count(where),
    ]);

    const dtos = await Promise.all(
      items.map(async (item) => {
        const dto = this.mapper.map<any, DiscussionTopicResponseDTO>(
          item,
          'DiscussionTopic',
          'DiscussionTopicResponseDTO',
        );
        return dto;
      }),
    );

    return {
      data: dtos,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findDiscussionById(
    id: string,
    currentUserId?: string,
  ): Promise<DiscussionTopicResponseDTO> {
    const discussion = await this.discussionRepository.findById(id);
    if (!discussion) throw new NotFoundException('Discussion not found');

    // Increment view count
    await this.discussionRepository.update(id, { viewCount: { increment: 1 } });

    return this.mapper.map<any, DiscussionTopicResponseDTO>(
      discussion,
      'DiscussionTopic',
      'DiscussionTopicResponseDTO',
    );
  }

  async deleteDiscussion(id: string, userId: string): Promise<boolean> {
    const discussion = await this.discussionRepository.findById(id);
    if (!discussion) throw new NotFoundException('Discussion not found');

    if (discussion.authorId !== userId) {
      throw new Error('Unauthorized to delete this Discussion');
    }

    try {
      await this.discussionRepository.delete(id);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete Discussion ${id}: ${error}`);
      throw error;
    }
  }

  async updateDiscussion(
    id: string,
    dto: DiscussionTopicUpdateDTO,
  ): Promise<DiscussionTopicResponseDTO> {
    const discussion = await this.discussionRepository.findById(id);
    if (!discussion) throw new NotFoundException('Discussion not found');

    const updated = await this.discussionRepository.update(id, {
      title: dto.title,
      content: dto.content,
      isPinned: dto.isPinned,
      isLocked: dto.isLocked,
      category: (dto as any).category || DiscussionTopicCategory.GENERAL,
      status: (dto as any).status || DiscussionTopicStatus.OPEN,
    });

    const refreshed = await this.discussionRepository.findById(id);
    return this.mapper.map<any, DiscussionTopicResponseDTO>(
      refreshed!,
      'DiscussionTopic',
      'DiscussionTopicResponseDTO',
    );
  }
}
