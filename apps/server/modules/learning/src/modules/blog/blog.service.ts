import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService, generateSlug } from '@server/shared';
import { BlogPostStatus, PaginatedResponseDTO } from '@workspace/schemas';
import type {
  BlogPostCreateDTO,
  BlogPostUpdateDTO,
  BlogPostQueryDTO,
  BlogPostResponseDTO,
} from '@workspace/schemas';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(
    private readonly prisma: PrismaService,
  ) { }

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

  async createPost(dto: BlogPostCreateDTO): Promise<BlogPostResponseDTO> {
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

    // Check if author exists in User table
    const user = await this.prisma.user.findUnique({
      where: { id: dto.authorId },
    });

    if (!user) {
      throw new NotFoundException(`Author with id "${dto.authorId}" not found`);
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
        publishedAt: finalDto.publishedAt || null,
        seoTitle: finalDto.seoTitle,
        seoDescription: finalDto.seoDescription,
        tags: finalDto.tags || [],
      },
    });

    // Images are stored in FileAsset table via storage service
    // No need to handle images here - they are managed by storage service

    // Format response with author info
    return this.formatPostResponseWithAuthor(post);
  }

  async findAllPosts(query: BlogPostQueryDTO): Promise<PaginatedResponseDTO<BlogPostResponseDTO>> {
    // Parse pagination params to numbers (query params are strings)
    const pageNum = parseInt(String(query.page || 1), 10);
    const limitNum = parseInt(String(query.limit || 10), 10);
    const skip = (pageNum - 1) * limitNum;

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
        take: limitNum,
        orderBy,
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return {
      data: await Promise.all(posts.map((post) => this.formatPostResponseWithAuthor(post))),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    };
  }

  async findPostById(id: string): Promise<BlogPostResponseDTO> {
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException(`Post with id "${id}" not found`);
    }

    return this.formatPostResponseWithAuthor(post);
  }

  async updatePost(id: string, dto: BlogPostUpdateDTO): Promise<BlogPostResponseDTO> {
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

    if (dto.publishedAt !== undefined) {
      updateData.publishedAt = dto.publishedAt;
    }

    // Update tags if provided (tags is now a string array)
    if (dto.tags !== undefined) {
      updateData.tags = dto.tags;
    }

    const post = await this.prisma.blogPost.update({
      where: { id },
      data: updateData,
    });

    return this.formatPostResponseWithAuthor(post);
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

  private async formatPostResponseWithAuthor(post: any): Promise<BlogPostResponseDTO> {
    // Get author info from User table
    let authorInfo: { id: string; displayName: string; email: string } | null = null;

    if (post.authorId) {
      try {
        const user = await this.prisma.user.findUnique({
          where: { id: post.authorId },
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        });

        if (user) {
          authorInfo = {
            id: user.id,
            displayName: user.displayName || user.email || 'Unknown',
            email: user.email,
          };
        }
      } catch (error: any) {
        // Silent fail - continue without author info
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


