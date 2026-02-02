import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { CommentLikeDTO } from '@workspace/schemas';

/**
 * Comment Like Service
 * Handles like/unlike operations for comments
 */
@Injectable()
export class CommentLikeService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Like a comment
     */
    async likeComment(dto: CommentLikeDTO) {
        // Check if comment exists
        const comment = await this.prisma.comment.findUnique({
            where: { id: dto.commentId },
        });

        if (!comment) {
            throw new NotFoundException(`Comment with id "${dto.commentId}" not found`);
        }

        // Check if user exists
        const user = await this.prisma.user.findUnique({
            where: { id: dto.userId },
        });

        if (!user) {
            throw new NotFoundException(`User with id "${dto.userId}" not found`);
        }

        // Check if already liked
        const existingLike = await this.prisma.commentLike.findUnique({
            where: {
                userId_commentId: {
                    userId: dto.userId,
                    commentId: dto.commentId,
                },
            },
        });

        if (existingLike) {
            throw new ConflictException('Comment already liked');
        }

        // Create like
        const like = await this.prisma.commentLike.create({
            data: {
                userId: dto.userId,
                commentId: dto.commentId,
            },
        });

        return like;
    }

    /**
     * Unlike a comment
     */
    async unlikeComment(dto: CommentLikeDTO) {
        // Check if like exists
        const existingLike = await this.prisma.commentLike.findUnique({
            where: {
                userId_commentId: {
                    userId: dto.userId,
                    commentId: dto.commentId,
                },
            },
        });

        if (!existingLike) {
            throw new NotFoundException('Like not found');
        }

        // Delete like
        await this.prisma.commentLike.delete({
            where: {
                userId_commentId: {
                    userId: dto.userId,
                    commentId: dto.commentId,
                },
            },
        });

        return { success: true };
    }

    /**
     * Get like count for a comment
     */
    async getCommentLikeCount(commentId: string): Promise<number> {
        return this.prisma.commentLike.count({
            where: { commentId },
        });
    }

    /**
     * Check if user liked a comment
     */
    async hasUserLikedComment(userId: string, commentId: string): Promise<boolean> {
        const like = await this.prisma.commentLike.findUnique({
            where: {
                userId_commentId: {
                    userId,
                    commentId,
                },
            },
        });

        return !!like;
    }

    /**
     * Get users who liked a comment
     */
    async getCommentLikes(commentId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [likes, total] = await Promise.all([
            this.prisma.commentLike.findMany({
                where: { commentId },
                include: {
                    user: {
                        select: {
                            id: true,
                            displayName: true,
                            avatarUrl: true,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.commentLike.count({ where: { commentId } }),
        ]);

        return {
            data: likes,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}
