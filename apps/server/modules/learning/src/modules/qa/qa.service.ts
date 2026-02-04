import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { PrismaService } from '@server/shared';
import { QARepository } from './qa.repository';
import {
    QACreateDTO,
    QAQueryDTO,
    QAResponseDTO,
    QAPaginatedResponse,
} from '@workspace/schemas';
import { Prisma } from '@prisma/generated';

@Injectable()
export class QAService {
    private readonly logger = new Logger(QAService.name);

    constructor(
        private readonly qaRepository: QARepository,
        private readonly prisma: PrismaService,
        @InjectMapper() private readonly mapper: Mapper,
    ) { }

    private toResponseDTO(qa: any): QAResponseDTO {
        return {
            id: qa.id,
            title: qa.title,
            content: qa.content,
            authorId: qa.authorId,
            tags: qa.tags,
            viewCount: qa.viewCount,
            likes: qa._count?.likes ?? qa.likeCount ?? 0,
            comments: qa._count?.comments ?? qa.commentCount ?? 0,
            createdAt: qa.createdAt,
            updatedAt: qa.updatedAt,
            author: qa.author ? {
                id: qa.author.id,
                displayName: qa.author.displayName,
                avatarUrl: qa.author.avatarUrl
            } : undefined,
            isLiked: false,
        };
    }

    async createQA(userId: string, dto: QACreateDTO): Promise<QAResponseDTO> {
        const qa = await this.qaRepository.create({
            title: dto.title,
            content: dto.content,
            tags: dto.tags || [],
            author: { connect: { id: userId } },
        });

        const created = await this.qaRepository.findById(qa.id);
        return this.toResponseDTO(created!);
    }

    async findAllQAs(query: QAQueryDTO, currentUserId?: string): Promise<QAPaginatedResponse> {
        const page = typeof query.page === 'string' ? parseInt(query.page, 10) : (query.page || 1);
        const limit = typeof query.limit === 'string' ? parseInt(query.limit, 10) : (query.limit || 20);
        const skip = (page - 1) * limit;

        const where: Prisma.QAWhereInput = {};
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
            // Override or merge logic. Since frontend sends either tags OR tagId currently, direct assignment is safe.
            // Using hasSome with single element implies "contains this tag"
            where.tags = { hasSome: [tagId] };
        }



        const orderBy: Prisma.QAOrderByWithRelationInput = {};
        if (query.sortBy === 'likes') {
            orderBy.likeCount = query.sortOrder || 'desc';
        } else if (query.sortBy === 'comments') {
            orderBy.commentCount = query.sortOrder || 'desc';
        } else if (query.sortBy) {
            // Safe cast or fallback
            try {
                orderBy[query.sortBy as keyof Prisma.QAOrderByWithRelationInput] = query.sortOrder || 'desc';
            } catch (e) {
                orderBy.createdAt = 'desc';
            }
        } else {
            orderBy.createdAt = 'desc';
        }

        const [items, total] = await Promise.all([
            this.qaRepository.findAll({ skip, take: limit, where, orderBy }),
            this.qaRepository.count(where)
        ]);

        const dtos = await Promise.all(items.map(async item => {
            const dto = this.toResponseDTO(item);
            if (currentUserId) {
                const count = await this.prisma.qAUserLike.count({
                    where: { qaId: item.id, userId: currentUserId }
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

    async findQAById(id: string, currentUserId?: string): Promise<QAResponseDTO> {
        const qa = await this.qaRepository.findById(id);
        if (!qa) throw new NotFoundException('QA not found');

        // Increment view count
        await this.qaRepository.update(id, { viewCount: { increment: 1 } });

        const dto = this.toResponseDTO(qa);
        if (currentUserId) {
            const count = await this.prisma.qAUserLike.count({
                where: { qaId: id, userId: currentUserId }
            });
            dto.isLiked = count > 0;
        }
        return dto;
    }

    async toggleLike(id: string, userId: string): Promise<{ isLiked: boolean, likeCount: number }> {
        const existing = await this.prisma.qAUserLike.findUnique({
            where: { qaId_userId: { qaId: id, userId } }
        });

        if (existing) {
            await this.prisma.qAUserLike.delete({
                where: { qaId_userId: { qaId: id, userId } }
            });
            // Try updating count field, ignore error if field missing
            try {
                await this.qaRepository.update(id, { likeCount: { decrement: 1 } });
            } catch (e) { }
        } else {
            await this.prisma.qAUserLike.create({
                data: { qaId: id, userId }
            });
            try {
                await this.qaRepository.update(id, { likeCount: { increment: 1 } });
            } catch (e) { }
        }

        const likeCount = await this.prisma.qAUserLike.count({ where: { qaId: id } });
        return { isLiked: !existing, likeCount };
    }

    async deleteQA(id: string, userId: string): Promise<boolean> {
        // First verify ownership or admin rights if needed
        const qa = await this.qaRepository.findById(id);
        if (!qa) throw new NotFoundException('QA not found');

        if (qa.authorId !== userId) {
            // For now simple check, in real app might check role
            throw new Error('Unauthorized to delete this QA');
        }

        try {
            await this.qaRepository.delete(id);
            return true;
        } catch (error) {
            this.logger.error(`Failed to delete QA ${id}: ${error}`);
            throw error;
        }
    }
}
