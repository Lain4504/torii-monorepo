import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
    Inject,
} from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { PrismaService, generateSlug, REDIS_CLIENT } from '@server/shared';
import Redis from 'ioredis';
import { BlogStatus, PaginatedResponseDTO } from '@workspace/schemas';
import type {
    BlogCreateDTO,
    BlogUpdateDTO,
    BlogQueryDTO,
    BlogResponseDTO,
} from '@workspace/schemas';
import type { Blog, Prisma } from '@prisma/generated';
import type { IBlogService } from '@server/academy/interfaces/services/i-blog.service';
import { BlogRepository } from '@server/academy/modules/blog/blog.repository';

/**
 * Blog Service
 * Handles business logic for blogs
 */
@Injectable()
export class BlogService implements IBlogService {
    private readonly logger = new Logger(BlogService.name);

    constructor(
        private readonly blogRepository: BlogRepository,
        private readonly prisma: PrismaService,
        @InjectMapper() private readonly mapper: Mapper,
        @Inject(REDIS_CLIENT) private readonly redis: Redis,
    ) { }

    /**
     * Map Blog entity to BlogResponseDTO using AutoMapper
     */
    private toBlogResponseDTO(blog: Blog): BlogResponseDTO {
        return this.mapper.map<Blog, BlogResponseDTO>(
            blog,
            'Blog',
            'BlogResponseDTO',
        );
    }

    /**
     * Ensure unique slug by appending date and timestamp if needed
     */
    private async ensureUniqueSlug(
        baseSlug: string,
        checkExists: (slug: string) => Promise<boolean>,
    ): Promise<string> {
        const today = new Date();
        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const slug = `${baseSlug}-${dateStr}`;

        const existing = await checkExists(slug);

        if (!existing) {
            return slug;
        }

        // If slug exists, append timestamp to ensure uniqueness
        const timestamp = Date.now();
        return `${baseSlug}-${dateStr}-${timestamp}`;
    }

    /**
     * Create new blog blog
     */
    async createBlog(dto: BlogCreateDTO): Promise<BlogResponseDTO> {
        // Auto-generate slug from title if not provided
        const baseSlug = dto.slug || generateSlug(dto.title);

        // Auto-generate unique slug if slug already exists
        const slug = await this.ensureUniqueSlug(baseSlug, async (slugToCheck) =>
            this.blogRepository.slugExists(slugToCheck),
        );

        const finalDto = { ...dto, slug };

        // authorId is required
        if (!dto.authorId) {
            throw new BadRequestException('Author ID is required');
        }

        // Check if author exists in User table
        const user = await this.prisma.user.findUnique({
            where: { id: dto.authorId },
        });

        if (!user) {
            throw new NotFoundException(`Author with id "${dto.authorId}" not found`);
        }

        // Create blog
        if (finalDto.status === BlogStatus.PUBLISHED && !finalDto.publishedAt) {
            finalDto.publishedAt = new Date();
        } else if (
            finalDto.publishedAt &&
            new Date(finalDto.publishedAt) > new Date()
        ) {
            finalDto.status = BlogStatus.SCHEDULED;
        }

        // Create blog
        const blog = await this.blogRepository.create({
            title: finalDto.title,
            slug: finalDto.slug,
            content: finalDto.content,
            coverImageUrl: finalDto.coverImageUrl,
            status: finalDto.status || BlogStatus.DRAFT,
            publishedAt: finalDto.publishedAt || null,
            seoTitle: finalDto.seoTitle,
            seoDescription: finalDto.seoDescription,
            author: {
                connect: {
                    id: finalDto.authorId,
                },
            },
        });

        return this.toBlogResponseDTO(blog);
    }

    /**
     * Find all blogs with pagination and filters
     */
    async findAllBlogs(
        query: BlogQueryDTO,
    ): Promise<PaginatedResponseDTO<BlogResponseDTO>> {
        const pageNum = parseInt(String(query.page || 1), 10);
        const limitNum = parseInt(String(query.limit || 10), 10);
        const skip = (pageNum - 1) * limitNum;

        const where: Prisma.BlogWhereInput = {};

        if (query.status) {
            where.status = query.status;
            // If status is published, only show posts with publishedAt <= now unless showScheduled is requested (admin)
            if (query.status === BlogStatus.PUBLISHED && !query.showScheduled) {
                where.publishedAt = {
                    lte: new Date(),
                };
            } else if (
                query.status === BlogStatus.SCHEDULED &&
                !query.showScheduled
            ) {
                // Exclude scheduled posts from public view unless requested
                where.status = {
                    not: BlogStatus.SCHEDULED,
                };
            }
        }

        if (query.authorId) {
            where.authorId = query.authorId;
        }

        if (query.search) {
            where.OR = [
                { title: { contains: query.search, mode: 'insensitive' } },
                { content: { contains: query.search, mode: 'insensitive' } },
                { slug: { contains: query.search, mode: 'insensitive' } },
            ];
        }

        const orderBy: Prisma.BlogOrderByWithRelationInput = {};
        if (query.sortBy) {
            orderBy[query.sortBy] = query.sortOrder || 'desc';
        } else {
            orderBy.publishedAt = 'desc';
        }

        const [blogs, total] = await Promise.all([
            this.blogRepository.findMany({
                where,
                skip,
                take: limitNum,
                orderBy,
            }),
            this.blogRepository.count(where),
        ]);

        return {
            data: blogs.map((blog) => this.toBlogResponseDTO(blog)),
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        };
    }

    /**
     * Find blog by ID
     */
    async findBlogById(
        id: string,
        showScheduled = false,
    ): Promise<BlogResponseDTO> {
        const blog = await this.blogRepository.findById(id);

        if (!blog) {
            throw new NotFoundException(`Blog with id "${id}" not found`);
        }

        // Check if scheduled
        const isScheduled = blog.status === BlogStatus.SCHEDULED;
        if (isScheduled && !showScheduled) {
            throw new NotFoundException(`Blog with id "${id}" not found`);
        }

        return this.toBlogResponseDTO(blog);
    }

    /**
     * Increment view count for a blog
     */
    async incrementViewCount(id: string, ip?: string): Promise<void> {
        const blog = await this.blogRepository.findById(id);

        if (!blog) {
            throw new NotFoundException(`Blog with id "${id}" not found`);
        }

        // Check if scheduled (don't count views for scheduled posts if public)
        const isScheduled = blog.status === BlogStatus.SCHEDULED;
        if (isScheduled) return;

        // IP Throttling: 1 view per IP per blog every 5 seconds
        if (ip && ip !== 'unknown') {
            const key = `blog_view_throttle:${ip}:${id}`;
            const exists = await this.redis.get(key);
            if (exists) return; // Throttle

            await this.redis.set(key, '1', 'EX', 3600);
        }

        await this.blogRepository.incrementViewCount(id);
    }

    /**
     * Find blog by slug
     */
    async findBlogBySlug(
        slug: string,
        showScheduled = false,
    ): Promise<BlogResponseDTO> {
        const blog = await this.blogRepository.findBySlug(slug);

        if (!blog) {
            throw new NotFoundException(`Blog with slug "${slug}" not found`);
        }

        // Check if scheduled
        const isScheduled = blog.status === BlogStatus.SCHEDULED;
        if (isScheduled && !showScheduled) {
            throw new NotFoundException(`Blog with slug "${slug}" not found`);
        }

        return this.toBlogResponseDTO(blog);
    }

    /**
     * Update blog
     */
    async updateBlog(id: string, dto: BlogUpdateDTO): Promise<BlogResponseDTO> {
        const existing = await this.blogRepository.findById(id);

        if (!existing) {
            throw new NotFoundException(`Blog with id "${id}" not found`);
        }

        // If title is being updated, regenerate slug
        let slug = existing.slug;
        if (dto.title && dto.title !== existing.title) {
            const baseSlug = dto.slug || generateSlug(dto.title);
            slug = await this.ensureUniqueSlug(baseSlug, async (slugToCheck) => {
                const slugExists = await this.blogRepository.findBySlug(slugToCheck);
                return !!slugExists && slugExists.id !== id;
            });
        } else if (dto.slug && dto.slug !== existing.slug) {
            const slugExists = await this.blogRepository.findBySlug(dto.slug);

            if (slugExists) {
                throw new BadRequestException(
                    `Blog with slug "${dto.slug}" already exists`,
                );
            }
            slug = dto.slug;
        }

        const updateData: Prisma.BlogUpdateInput = { ...dto };

        // Update slug if it was regenerated
        if (slug !== existing.slug) {
            updateData.slug = slug;
        }

        if (dto.publishedAt !== undefined) {
            updateData.publishedAt = dto.publishedAt;
            if (dto.status === BlogStatus.PUBLISHED && !dto.publishedAt) {
                updateData.publishedAt = new Date();
            } else if (dto.publishedAt && new Date(dto.publishedAt) > new Date()) {
                updateData.status = BlogStatus.SCHEDULED;
            }
        }

        const blog = await this.blogRepository.update(id, updateData);

        return this.toBlogResponseDTO(blog);
    }

    /**
     * Publish blog (change status to published)
     */
    async publishBlog(id: string): Promise<BlogResponseDTO> {
        const blog = await this.blogRepository.findById(id);

        if (!blog) {
            throw new NotFoundException(`Blog with id "${id}" not found`);
        }

        if (blog.status === BlogStatus.PUBLISHED) {
            throw new BadRequestException('Blog is already published');
        }

        const updated = await this.blogRepository.update(id, {
            status: BlogStatus.PUBLISHED,
            publishedAt: new Date(),
        });

        return this.toBlogResponseDTO(updated);
    }

    /**
     * Delete blog
     */
    async deleteBlog(id: string) {
        const blog = await this.blogRepository.findById(id);

        if (!blog) {
            throw new NotFoundException(`Blog with id "${id}" not found`);
        }

        await this.blogRepository.delete(id);

        return { success: true };
    }
}
