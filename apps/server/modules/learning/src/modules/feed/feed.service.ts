import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { PrismaService } from '@server/shared';
import { FeedRepository } from '@server/learning/modules/feed/feed.repository';
import {
    FeedCreateDTO,
    FeedQueryDTO,
    FeedResponseDTO,
    FeedPaginatedResponse,
} from '@workspace/schemas';
import { Prisma } from '@prisma/generated';

@Injectable()
export class FeedService {
    private readonly logger = new Logger(FeedService.name);

    constructor(
        private readonly feedRepository: FeedRepository,
        private readonly prisma: PrismaService,
        @InjectMapper() private readonly mapper: Mapper,
    ) { }

    async createFeed(userId: string, dto: FeedCreateDTO): Promise<FeedResponseDTO> {
        const feed = await this.feedRepository.create({
            title: dto.title,
            content: dto.content,
            tags: dto.tags || [],
            author: { connect: { id: userId } },
        });

        const created = await this.feedRepository.findById(feed.id);
        return this.mapper.map<any, FeedResponseDTO>(created!, 'Feed', 'FeedResponseDTO');
    }

    async findAllFeeds(query: FeedQueryDTO, currentUserId?: string): Promise<FeedPaginatedResponse> {
        const page = typeof query.page === 'string' ? parseInt(query.page, 10) : (query.page || 1);
        const limit = typeof query.limit === 'string' ? parseInt(query.limit, 10) : (query.limit || 20);
        const skip = (page - 1) * limit;

        const where: Prisma.FeedWhereInput = {};
        if (query.search) {
            where.OR = [
                { title: { contains: query.search, mode: 'insensitive' } },
                { content: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        if (query.authorId) {
            where.authorId = query.authorId;
        }
        if (query.tags) {
            const tags = Array.isArray(query.tags) ? query.tags : [query.tags];
            where.tags = { hasSome: Array.isArray(tags) ? tags : [tags] };
        }

        // Support filtering by single tag/category via tagId param (used by frontend)
        if ((query as any).tagId) {
            const tagId = (query as any).tagId;
            where.tags = { hasSome: [tagId] };
        }

        const orderBy: Prisma.FeedOrderByWithRelationInput = {};
        if (query.sortBy === 'likes') {
            orderBy.likeCount = query.sortOrder || 'desc';
        } else if (query.sortBy === 'comments') {
            orderBy.commentCount = query.sortOrder || 'desc';
        } else if (query.sortBy) {
            try {
                orderBy[query.sortBy as keyof Prisma.FeedOrderByWithRelationInput] = query.sortOrder || 'desc';
            } catch (e) {
                orderBy.createdAt = 'desc';
            }
        } else {
            orderBy.createdAt = 'desc';
        }

        const [items, total] = await Promise.all([
            this.feedRepository.findAll({ skip, take: limit, where, orderBy }),
            this.feedRepository.count(where)
        ]);

        const dtos = await Promise.all(items.map(async item => {
            const dto = this.mapper.map<any, FeedResponseDTO>(item, 'Feed', 'FeedResponseDTO');
            if (currentUserId) {
                const count = await this.prisma.feedUserLike.count({
                    where: { feedId: item.id, userId: currentUserId }
                });
                dto.isLiked = count > 0;
            }
            return dto;
        }));

        return {
            data: dtos,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findFeedById(id: string, currentUserId?: string): Promise<FeedResponseDTO> {
        const feed = await this.feedRepository.findById(id);
        if (!feed) throw new NotFoundException('Feed not found');

        // Increment view count
        await this.feedRepository.update(id, { viewCount: { increment: 1 } });

        const dto = this.mapper.map<any, FeedResponseDTO>(feed, 'Feed', 'FeedResponseDTO');
        if (currentUserId) {
            const count = await this.prisma.feedUserLike.count({
                where: { feedId: id, userId: currentUserId }
            });
            dto.isLiked = count > 0;
        }
        return dto;
    }

    async toggleLike(id: string, userId: string): Promise<{ isLiked: boolean, likeCount: number }> {
        const existing = await this.prisma.feedUserLike.findUnique({
            where: { feedId_userId: { feedId: id, userId } }
        });

        if (existing) {
            await this.prisma.feedUserLike.delete({
                where: { feedId_userId: { feedId: id, userId } }
            });
            try {
                await this.feedRepository.update(id, { likeCount: { decrement: 1 } });
            } catch (e) { }
        } else {
            await this.prisma.feedUserLike.create({
                data: { feedId: id, userId }
            });
            try {
                await this.feedRepository.update(id, { likeCount: { increment: 1 } });
            } catch (e) { }
        }

        const likeCount = await this.prisma.feedUserLike.count({ where: { feedId: id } });
        return { isLiked: !existing, likeCount };
    }

    async deleteFeed(id: string, userId: string): Promise<boolean> {
        const feed = await this.feedRepository.findById(id);
        if (!feed) throw new NotFoundException('Feed not found');

        if (feed.authorId !== userId) {
            throw new Error('Unauthorized to delete this Feed');
        }

        try {
            await this.feedRepository.delete(id);
            return true;
        } catch (error) {
            this.logger.error(`Failed to delete Feed ${id}: ${error}`);
            throw error;
        }
    }
}
