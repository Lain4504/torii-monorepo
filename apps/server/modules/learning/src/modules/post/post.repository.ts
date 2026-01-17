import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { Post, Prisma } from '@prisma/generated';
import type { IPostRepository } from '../../interfaces/repositories';

/**
 * Post Repository
 * Handles all database operations for Post entity
 */
@Injectable()
export class PostRepository implements IPostRepository {
    private readonly logger = new Logger(PostRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Find post by ID
     */
    async findById(id: string): Promise<Post | null> {
        return this.prisma.post.findUnique({
            where: { id },
        });
    }

    /**
     * Find post by slug
     */
    async findBySlug(slug: string): Promise<Post | null> {
        return this.prisma.post.findUnique({
            where: { slug },
        });
    }

    /**
     * Find all posts with pagination and filters
     */
    async findMany(options: {
        skip: number;
        take: number;
        where?: Prisma.PostWhereInput;
        orderBy?: Prisma.PostOrderByWithRelationInput;
    }): Promise<Post[]> {
        return this.prisma.post.findMany({
            where: options.where,
            skip: options.skip,
            take: options.take,
            orderBy: options.orderBy || { publishedAt: 'desc' },
        });
    }

    /**
     * Count posts with optional filter
     */
    async count(where?: Prisma.PostWhereInput): Promise<number> {
        return this.prisma.post.count({ where });
    }

    /**
     * Create new post
     */
    async create(data: Prisma.PostCreateInput): Promise<Post> {
        return this.prisma.post.create({
            data,
        });
    }

    /**
     * Update post by ID
     */
    async update(id: string, data: Prisma.PostUpdateInput): Promise<Post> {
        return this.prisma.post.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });
    }

    /**
     * Delete post (hard delete)
     */
    async delete(id: string): Promise<void> {
        await this.prisma.post.delete({
            where: { id },
        });
    }

    /**
     * Check if slug exists
     */
    async slugExists(slug: string): Promise<boolean> {
        const post = await this.findBySlug(slug);
        return !!post;
    }

    /**
     * Increment view count
     */
    async incrementViewCount(id: string): Promise<Post> {
        return this.prisma.post.update({
            where: { id },
            data: {
                viewCount: {
                    increment: 1,
                },
            },
        });
    }


}


