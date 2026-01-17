import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { generateSlug } from '@server/shared';
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
    @InjectMapper() private readonly mapper: Mapper,
  ) { }

  /**
   * Map Post entity to PostResponseDTO using AutoMapper
   */
  private toPostResponseDTO(post: Post): PostResponseDTO {
    return this.mapper.map<Post, PostResponseDTO>(post, 'Post', 'PostResponseDTO');
  }

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

    // Create post (DB will validate authorId via foreign key constraint)
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

    return this.toPostResponseDTO(post);
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
      data: posts.map((post) => this.toPostResponseDTO(post)),
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

    return this.toPostResponseDTO(post);
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

    return this.toPostResponseDTO(post);
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

    return this.toPostResponseDTO(post);
  }

  /**
   * Publish post (change status to published)
   */
  async publishPost(id: string): Promise<PostResponseDTO> {
    const post = await this.postRepository.findById(id);

    if (!post) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }

    if (post.status === PostStatus.PUBLISHED) {
      throw new BadRequestException('Post is already published');
    }

    const updated = await this.postRepository.update(id, {
      status: PostStatus.PUBLISHED,
      publishedAt: new Date(),
    });

    return this.toPostResponseDTO(updated);
  }

  /**
   * Toggle like for a post
   */
  async toggleLike(id: string, userId: string): Promise<{ liked: boolean; likeCount: number }> {
    const post = await this.postRepository.findById(id);

    if (!post) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }

    // For simplicity, we just increment/decrement the likeCount
    // In a real app, you'd track who liked what in a separate table
    // For now, we'll just toggle: if current likeCount is even, increment, else decrement
    // This is a simplified implementation - you should implement proper like tracking
    const newLikeCount = post.likeCount + 1;

    await this.postRepository.update(id, {
      likeCount: newLikeCount,
    });

    return {
      liked: true,
      likeCount: newLikeCount,
    };
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
}


