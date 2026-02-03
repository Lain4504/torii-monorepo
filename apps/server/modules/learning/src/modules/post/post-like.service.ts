import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { PostLikeDTO } from '@workspace/schemas';

/**
 * Post Like Service
 * Handles like/unlike operations for posts
 */
@Injectable()
export class PostLikeService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Like a post
     */
    async likePost(dto: PostLikeDTO) {
        // Check if post exists
        const post = await this.prisma.post.findUnique({
            where: { id: dto.postId },
        });

        if (!post) {
            throw new NotFoundException(`Post with id "${dto.postId}" not found`);
        }

        // Check if user exists
        const user = await this.prisma.user.findUnique({
            where: { id: dto.userId },
        });

        if (!user) {
            throw new NotFoundException(`User with id "${dto.userId}" not found`);
        }

        // Check if already liked
        const existingLike = await this.prisma.postLike.findUnique({
            where: {
                userId_postId: {
                    userId: dto.userId,
                    postId: dto.postId,
                },
            },
        });

        if (existingLike) {
            throw new ConflictException('Post already liked');
        }

        // Create like
        const like = await this.prisma.postLike.create({
            data: {
                userId: dto.userId,
                postId: dto.postId,
            },
        });

        return like;
    }

    /**
     * Unlike a post
     */
    async unlikePost(dto: PostLikeDTO) {
        // Check if like exists
        const existingLike = await this.prisma.postLike.findUnique({
            where: {
                userId_postId: {
                    userId: dto.userId,
                    postId: dto.postId,
                },
            },
        });

        if (!existingLike) {
            throw new NotFoundException('Like not found');
        }

        // Delete like
        await this.prisma.postLike.delete({
            where: {
                userId_postId: {
                    userId: dto.userId,
                    postId: dto.postId,
                },
            },
        });

        return { success: true };
    }

    /**
     * Get like count for a post
     */
    async getPostLikeCount(postId: string): Promise<number> {
        return this.prisma.postLike.count({
            where: { postId },
        });
    }

    /**
     * Check if user liked a post
     */
    async hasUserLikedPost(userId: string, postId: string): Promise<boolean> {
        const like = await this.prisma.postLike.findUnique({
            where: {
                userId_postId: {
                    userId,
                    postId,
                },
            },
        });

        return !!like;
    }

    /**
     * Get users who liked a post
     */
    async getPostLikes(postId: string, page = 1, limit = 20) {
        const skip = (page - 1) * limit;

        const [likes, total] = await Promise.all([
            this.prisma.postLike.findMany({
                where: { postId },
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
            this.prisma.postLike.count({ where: { postId } }),
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
