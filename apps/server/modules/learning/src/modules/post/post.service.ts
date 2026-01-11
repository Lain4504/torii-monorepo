import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { PrismaService, generateSlug } from '@server/shared';
import { PostStatus, PaginatedResponseDTO } from '@workspace/schemas';
import type {
  PostCreateDTO,
  PostUpdateDTO,
  PostQueryDTO,
  PostResponseDTO,
} from '@workspace/schemas';
import type { Post, Prisma } from '@prisma/generated';
import type { IPostService } from '../../interfaces/services';
import { PostRepository } from './post.repository';

/**
 * Post Service
 * Handles business logic for posts
 */
@Injectable()
export class PostService implements IPostService {
  private readonly logger = new Logger(PostService.name);

  constructor(
    private readonly postRepository: PostRepository,
    private readonly prisma: PrismaService,
    @InjectMapper() private readonly mapper: Mapper,
  ) { }

  /**
   * Ensure unique slug by appending date and timestamp if needed
   */
  private async ensureUniqueSlug(baseSlug: string, checkExists: (slug: string) => Promise<boolean>): Promise<string> {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    let slug = `${baseSlug}-${dateStr}`;

    const existing = await checkExists(slug);

    if (!existing) {
      return slug;
    }

    // If slug exists, append timestamp to ensure uniqueness
    const timestamp = Date.now();
    return `${baseSlug}-${dateStr}-${timestamp}`;
  }

  /**
   * Create new blog post
   */
  async createPost(dto: PostCreateDTO): Promise<PostResponseDTO> {
    // Auto-generate slug from title if not provided
    const baseSlug = dto.slug || generateSlug(dto.title);

    // Auto-generate unique slug if slug already exists
    const slug = await this.ensureUniqueSlug(
      baseSlug,
      async (slugToCheck) => this.postRepository.slugExists(slugToCheck),
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

    // Create post
    const post = await this.postRepository.create({
      title: finalDto.title,
      slug: finalDto.slug,
      excerpt: finalDto.excerpt,
      content: finalDto.content,
      coverImageUrl: finalDto.coverImageUrl,
      authorId: finalDto.authorId,
      status: finalDto.status || PostStatus.DRAFT,
      publishedAt: finalDto.publishedAt || null,
      seoTitle: finalDto.seoTitle,
      seoDescription: finalDto.seoDescription,
      tags: finalDto.tags || [],
    });

    return this.formatPostResponseWithAuthor(post);
  }

  /**
   * Find all posts with pagination and filters
   */
  async findAllPosts(query: PostQueryDTO): Promise<PaginatedResponseDTO<PostResponseDTO>> {
    const pageNum = parseInt(String(query.page || 1), 10);
    const limitNum = parseInt(String(query.limit || 10), 10);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.PostWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.authorId) {
      where.authorId = query.authorId;
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { excerpt: { contains: query.search, mode: 'insensitive' } },
        { content: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query.tagId) {
      where.tags = {
        has: query.tagId,
      };
    }

    const orderBy: Prisma.PostOrderByWithRelationInput = {};
    if (query.sortBy) {
      orderBy[query.sortBy] = query.sortOrder || 'desc';
    } else {
      orderBy.publishedAt = 'desc';
    }

    const [posts, total] = await Promise.all([
      this.postRepository.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
      }),
      this.postRepository.count(where),
    ]);

    return {
      data: await Promise.all(posts.map((post) => this.formatPostResponseWithAuthor(post))),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  /**
   * Find post by ID
   */
  async findPostById(id: string): Promise<PostResponseDTO> {
    const post = await this.postRepository.findById(id);

    if (!post) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }

    return this.formatPostResponseWithAuthor(post);
  }

  /**
   * Increment view count for a post
   */
  async incrementViewCount(id: string): Promise<void> {
    const post = await this.postRepository.findById(id);

    if (!post) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }

    await this.postRepository.incrementViewCount(id);
  }

  /**
   * Find post by slug
   */
  async findPostBySlug(slug: string): Promise<PostResponseDTO> {
    const post = await this.postRepository.findBySlug(slug);

    if (!post) {
      throw new NotFoundException(`Post with slug "${slug}" not found`);
    }

    return this.formatPostResponseWithAuthor(post);
  }

  /**
   * Update post
   */
  async updatePost(id: string, dto: PostUpdateDTO): Promise<PostResponseDTO> {
    const existing = await this.postRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }

    // If title is being updated, regenerate slug
    let slug = existing.slug;
    if (dto.title && dto.title !== existing.title) {
      const baseSlug = dto.slug || generateSlug(dto.title);
      slug = await this.ensureUniqueSlug(
        baseSlug,
        async (slugToCheck) => {
          const slugExists = await this.postRepository.findBySlug(slugToCheck);
          return !!slugExists && slugExists.id !== id;
        },
      );
    } else if (dto.slug && dto.slug !== existing.slug) {
      const slugExists = await this.postRepository.findBySlug(dto.slug);

      if (slugExists) {
        throw new BadRequestException(`Post with slug "${dto.slug}" already exists`);
      }
      slug = dto.slug;
    }

    const updateData: Prisma.PostUpdateInput = { ...dto };

    // Update slug if it was regenerated
    if (slug !== existing.slug) {
      updateData.slug = slug;
    }

    if (dto.publishedAt !== undefined) {
      updateData.publishedAt = dto.publishedAt;
    }

    if (dto.tags !== undefined) {
      updateData.tags = dto.tags;
    }

    const post = await this.postRepository.update(id, updateData);

    return this.formatPostResponseWithAuthor(post);
  }

  /**
   * Delete post
   */
  async deletePost(id: string) {
    const post = await this.postRepository.findById(id);

    if (!post) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }

    await this.postRepository.delete(id);

    return { success: true };
  }

  /**
   * Map Post entity to PostResponseDTO using AutoMapper
   */
  private toPostResponseDTO(post: Post): PostResponseDTO {
    return this.mapper.map<Post, PostResponseDTO>(post, 'Post', 'PostResponseDTO');
  }

  /**
   * Format post response with author info
   */
  private async formatPostResponseWithAuthor(post: Post): Promise<PostResponseDTO> {
    const dto = this.toPostResponseDTO(post);

    // Load author info separately
    if (post.authorId) {
      try {
        const user = await this.prisma.user.findUnique({
          where: { id: post.authorId },
          select: {
            id: true,
            displayName: true,
            email: true,
            avatarUrl: true,
          },
        });

        if (user) {
          dto.author = {
            id: user.id,
            displayName: user.displayName || user.email || 'Unknown',
            avatarUrl: user.avatarUrl || undefined,
          };
        }
      } catch (error: any) {
        // Silent fail
      }
    }

    return dto;
  }
}


