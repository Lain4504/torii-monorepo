import { Injectable, NotFoundException, BadRequestException, Logger, Inject } from '@nestjs/common';
import { PrismaService, SUPABASE_CLIENT, generateSlug } from '@server/shared';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  CreateBlogPostDto,
  UpdateBlogPostDto,
  BlogPostQueryDto,
  BlogPostStatus,
} from '@workspace/dtos';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  /**
   * Ensure unique slug by appending date and timestamp if needed
   * Similar to course.service.ts approach - uses date format instead of counter
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

  // =========================
  // BLOG POST METHODS
  // =========================

  async createPost(dto: CreateBlogPostDto) {
    // Auto-generate slug from title if not provided
    const baseSlug = dto.slug || generateSlug(dto.title);
    
    // Auto-generate unique slug if slug already exists (using date format)
    const slug = await this.ensureUniqueSlug(
      baseSlug,
      async (slugToCheck) => {
        const existing = await this.prisma.blogPost.findUnique({
          where: { slug: slugToCheck },
        });
        return !!existing;
      },
    );

    // Sử dụng slug đã được đảm bảo unique
    const finalDto = { ...dto, slug };

    // authorId là required - phải có từ JWT token hoặc DTO
    if (!dto.authorId) {
      throw new BadRequestException('Author ID is required');
    }

    // Check if author exists in Supabase Auth
    const { data: user, error } = await this.supabase.auth.admin.getUserById(
      dto.authorId,
    );

    if (error || !user) {
      throw new NotFoundException(`Author with id "${dto.authorId}" not found in Supabase Auth`);
    }

    // Create post (matching SQL schema)
    const post = await this.prisma.blogPost.create({
      data: {
        title: finalDto.title,
        slug: finalDto.slug,
        excerpt: finalDto.excerpt,
        content: finalDto.content,
        coverImageUrl: finalDto.coverImageUrl,
        authorId: finalDto.authorId,
        status: finalDto.status || BlogPostStatus.DRAFT,
        publishedAt: finalDto.publishedAt ? new Date(finalDto.publishedAt) : null,
        seoTitle: finalDto.seoTitle,
        seoDescription: finalDto.seoDescription,
        tags: finalDto.tags || [],
      },
    });

    // Images are stored in FileAsset table via storage service
    // No need to handle images here - they are managed by storage service

    // Lấy author info từ Supabase và format response
    return this.formatPostResponseWithSupabaseAuthor(post);
  }

  async findAllPosts(query: BlogPostQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

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
      // Filter by tag name in tags array
      where.tags = {
        has: query.tagId,
      };
    }

    const orderBy: any = {};
    if (query.sortBy) {
      orderBy[query.sortBy] = query.sortOrder || 'desc';
    } else {
      orderBy.publishedAt = 'desc';
    }

    const [posts, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return {
      data: await Promise.all(posts.map((post) => this.formatPostResponseWithSupabaseAuthor(post))),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  async findPostById(id: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }

    return this.formatPostResponseWithSupabaseAuthor(post);
  }

  async updatePost(id: string, dto: UpdateBlogPostDto) {
    const existing = await this.prisma.blogPost.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }

    // If title is being updated, regenerate slug using date format
    let slug = existing.slug;
    if (dto.title && dto.title !== existing.title) {
      const baseSlug = dto.slug || generateSlug(dto.title);
      slug = await this.ensureUniqueSlug(
        baseSlug,
        async (slugToCheck) => {
          // Check if slug exists and is not the current post's slug
          const slugExists = await this.prisma.blogPost.findUnique({
            where: { slug: slugToCheck },
          });
          return !!slugExists && slugExists.id !== id;
        },
      );
    } else if (dto.slug && dto.slug !== existing.slug) {
      // If slug is explicitly provided and different, check uniqueness
      const slugExists = await this.prisma.blogPost.findUnique({
        where: { slug: dto.slug },
      });

      if (slugExists) {
        throw new BadRequestException(`Post with slug "${dto.slug}" already exists`);
      }
      slug = dto.slug;
    }

    const updateData: any = { ...dto };
    
    // Update slug if it was regenerated
    if (slug !== existing.slug) {
      updateData.slug = slug;
    }
    
    if (dto.publishedAt) {
      updateData.publishedAt = new Date(dto.publishedAt);
    }

    // Update tags if provided (tags is now a string array)
    if (dto.tags !== undefined) {
      updateData.tags = dto.tags;
    }

    const post = await this.prisma.blogPost.update({
      where: { id },
      data: updateData,
    });

    return this.formatPostResponseWithSupabaseAuthor(post);
  }

  async deletePost(id: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }

    await this.prisma.blogPost.delete({
      where: { id },
    });

    return { success: true };
  }

  // =========================
  // HELPER METHODS
  // =========================

  // Images are now managed by FileAsset (storage service)
  // Use storage service to upload images and associate them with blog posts

  private async formatPostResponseWithSupabaseAuthor(post: any) {
    // Lấy author info từ Supabase
    let authorInfo: { id: string; fullName: string; avatarUrl: string | null } | null = null;
    if (post.authorId) {
      try {
        const { data: user, error } = await this.supabase.auth.admin.getUserById(
          post.authorId,
        );
        if (user && user.user) {
          authorInfo = {
            id: user.user.id,
            fullName: user.user.user_metadata?.full_name || user.user.user_metadata?.name || user.user.email || 'Unknown',
            avatarUrl: user.user.user_metadata?.avatar_url || null,
          };
        }
      } catch (error: any) {
        this.logger.warn(`Failed to get author info from Supabase: ${error?.message || 'Unknown error'}`);
      }
    }

    return {
      ...post,
      author: authorInfo,
      tags: post.tags || [], // tags is now a string array
      // Images are stored in FileAsset table via storage service
      // Query FileAsset with moduleOrigin='BLOG' and ownerId=post.id to get images
    };
  }
}

