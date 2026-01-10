import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { Comment, Prisma } from '@prisma/generated';
import type { ICommentRepository } from '../../interfaces/repositories';

/**
 * Comment Repository
 * Handles all database operations for Comment entity
 */
@Injectable()
export class CommentRepository implements ICommentRepository {
    private readonly logger = new Logger(CommentRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Find comment by ID
     */
    async findById(id: string): Promise<Comment | null> {
        return this.prisma.comment.findUnique({
            where: { id },
        });
    }

    /**
     * Find comment by ID with reply count
     */
    async findByIdWithReplyCount(id: string): Promise<(Comment & { _count: { replies: number } }) | null> {
        return this.prisma.comment.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { replies: true },
                },
            },
        });
    }

    /**
     * Find all comments with pagination and filters
     */
    async findMany(options: {
        skip: number;
        take: number;
        where?: Prisma.CommentWhereInput;
        orderBy?: Prisma.CommentOrderByWithRelationInput;
        includeReplyCount?: boolean;
    }): Promise<Comment[]> {
        return this.prisma.comment.findMany({
            where: options.where,
            skip: options.skip,
            take: options.take,
            orderBy: options.orderBy || { createdAt: 'desc' },
            include: options.includeReplyCount ? {
                _count: {
                    select: { replies: true },
                },
            } : undefined,
        });
    }

    /**
     * Count comments with optional filter
     */
    async count(where?: Prisma.CommentWhereInput): Promise<number> {
        return this.prisma.comment.count({ where });
    }

    /**
     * Create new comment
     */
    async create(data: Prisma.CommentCreateInput): Promise<Comment> {
        return this.prisma.comment.create({
            data,
        });
    }

    /**
     * Update comment by ID
     */
    async update(id: string, data: Prisma.CommentUpdateInput): Promise<Comment> {
        return this.prisma.comment.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });
    }

    /**
     * Soft delete comment
     */
    async softDelete(id: string): Promise<Comment> {
        return this.prisma.comment.update({
            where: { id },
            data: {
                status: 'deleted',
                content: '[deleted]',
                updatedAt: new Date(),
            },
        });
    }

    /**
     * Find comment with nested replies
     */
    async findWithReplies(id: string): Promise<(Comment & { replies: Comment[]; _count: { replies: number } }) | null> {
        return this.prisma.comment.findUnique({
            where: { id },
            include: {
                replies: {
                    where: { status: { not: 'deleted' } },
                    orderBy: { createdAt: 'asc' },
                },
                _count: {
                    select: { replies: true },
                },
            },
        });
    }

    /**
     * Increment like count
     */
    async incrementLikeCount(id: string): Promise<Comment> {
        return this.prisma.comment.update({
            where: { id },
            data: {
                likes: {
                    increment: 1,
                },
            },
        });
    }

    /**
     * Decrement like count
     */
    async decrementLikeCount(id: string): Promise<Comment> {
        return this.prisma.comment.update({
            where: { id },
            data: {
                likes: {
                    decrement: 1,
                },
            },
        });
    }
}


