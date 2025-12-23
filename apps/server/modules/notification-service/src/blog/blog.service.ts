import { Injectable, NotFoundException, BadRequestException, Logger, Inject } from '@nestjs/common';
import { PrismaService, SUPABASE_CLIENT, ensureUniqueSlug, generateSlug } from '@server/shared';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  CreateBlogPostDto,
  UpdateBlogPostDto,
  BlogPostQueryDto,
  CreateTagDto,
  TagQueryDto,
  BlogPostStatus,
} from '@workspace/dtos';

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  // =========================
  // BLOG POST METHODS
  // =========================

  async createPost(dto: CreateBlogPostDto) {
    // Auto-generate slug from title if not provided
    const baseSlug = dto.slug || generateSlug(dto.title);
    
    // Auto-generate unique slug if slug already exists
    const slug = await ensureUniqueSlug(
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

    // Calculate reading time if not provided
    const readingTime = finalDto.readingTime || this.calculateReadingTime(finalDto.content);

    // Create post
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
        readingTime,
        featured: finalDto.featured || false,
        pinned: finalDto.pinned || false,
        metaKeywords: finalDto.metaKeywords || [],
        ogImageUrl: finalDto.ogImageUrl,
        relatedPostIds: finalDto.relatedPostIds || [],
      },
      include: {
        // Author info sẽ lấy từ Supabase, không cần từ Prisma
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        images: {
          select: {
            id: true,
            imageUrl: true,
          },
        },
      },
    });

    // Add tags if provided
    if (finalDto.tagIds && finalDto.tagIds.length > 0) {
      await this.addTagsToPost(post.id, finalDto.tagIds);
    }

    // Add images if provided
    if (finalDto.images && finalDto.images.length > 0) {
      await Promise.all(
        finalDto.images.map((imageUrl) =>
          this.addImageToPost(post.id, imageUrl),
        ),
      );
      this.logger.log(`Added ${finalDto.images.length} image(s) to post ${post.id}`);
    }

    // Reload post with images
    const postWithImages = await this.prisma.blogPost.findUnique({
      where: { id: post.id },
      include: {
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        images: {
          select: {
            id: true,
            imageUrl: true,
          },
        },
      },
    });

    // Lấy author info từ Supabase và format response
    return this.formatPostResponseWithSupabaseAuthor(postWithImages);
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

    if (query.featured !== undefined) {
      where.featured = query.featured;
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
        some: {
          tagId: query.tagId,
        },
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
        include: {
          // Author info sẽ lấy từ Supabase, không cần từ Prisma
          tags: {
            include: {
              tag: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          images: {
            select: {
              id: true,
              imageUrl: true,
            },
          },
        },
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
      include: {
        // Author info sẽ lấy từ Supabase, không cần từ Prisma
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        images: {
          select: {
            id: true,
            imageUrl: true,
          },
        },
      },
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

    // Check slug uniqueness if changing
    if (dto.slug && dto.slug !== existing.slug) {
      const slugExists = await this.prisma.blogPost.findUnique({
        where: { slug: dto.slug },
      });

      if (slugExists) {
        throw new BadRequestException(`Post with slug "${dto.slug}" already exists`);
      }
    }

    // Calculate reading time if content changed
    let readingTime = dto.readingTime;
    if (dto.content && !dto.readingTime) {
      readingTime = this.calculateReadingTime(dto.content);
    }

    const updateData: any = { ...dto };
    if (dto.publishedAt) {
      updateData.publishedAt = new Date(dto.publishedAt);
    }
    if (readingTime !== undefined) {
      updateData.readingTime = readingTime;
    }

    const post = await this.prisma.blogPost.update({
      where: { id },
      data: updateData,
      include: {
        // Author info sẽ lấy từ Supabase, không cần từ Prisma
        tags: {
          include: {
            tag: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        images: {
          select: {
            id: true,
            imageUrl: true,
          },
        },
      },
    });

    // Update tags if provided
    if (dto.tagIds !== undefined) {
      await this.replacePostTags(id, dto.tagIds);
    }

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
  // TAG METHODS
  // =========================

  async createTag(dto: CreateTagDto) {
    // Auto-generate slug from name if not provided
    const baseSlug = dto.slug || generateSlug(dto.name);
    
    // Auto-generate unique slug if slug already exists
    const slug = await ensureUniqueSlug(
      baseSlug,
      async (slugToCheck) => {
        const existing = await this.prisma.tag.findUnique({
          where: { slug: slugToCheck },
        });
        return !!existing;
      },
    );

    return this.prisma.tag.create({
      data: {
        name: dto.name,
        slug,
        type: dto.type || 'blog',
        description: dto.description,
        icon: dto.icon,
      },
    });
  }

  async findAllTags(query: TagQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (query.type) {
      where.type = query.type;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [tags, total] = await Promise.all([
      this.prisma.tag.findMany({
        where,
        skip,
        take: limit,
        orderBy: { usageCount: 'desc' },
      }),
      this.prisma.tag.count({ where }),
    ]);

    return {
      data: tags,
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


  // =========================
  // HELPER METHODS
  // =========================

  private async addTagsToPost(postId: string, tagIds: string[]) {
    // Verify all tags exist
    const tags = await this.prisma.tag.findMany({
      where: { id: { in: tagIds } },
    });

    if (tags.length !== tagIds.length) {
      throw new BadRequestException('One or more tags not found');
    }

    // Create post-tag relationships
    await this.prisma.blogPostTag.createMany({
      data: tagIds.map((tagId) => ({
        postId,
        tagId,
      })),
      skipDuplicates: true,
    });

    // Update tag usage counts
    await this.prisma.tag.updateMany({
      where: { id: { in: tagIds } },
      data: {
        usageCount: { increment: 1 },
      },
    });
  }

  private async replacePostTags(postId: string, tagIds: string[]) {
    // Get current tags
    const currentTags = await this.prisma.blogPostTag.findMany({
      where: { postId },
    });

    const currentTagIds = currentTags.map((t) => t.tagId);

    // Tags to remove
    const toRemove = currentTagIds.filter((id) => !tagIds.includes(id));
    // Tags to add
    const toAdd = tagIds.filter((id) => !currentTagIds.includes(id));

    // Remove old tags
    if (toRemove.length > 0) {
      await this.prisma.blogPostTag.deleteMany({
        where: {
          postId,
          tagId: { in: toRemove },
        },
      });

      // Decrement usage counts
      await this.prisma.tag.updateMany({
        where: { id: { in: toRemove } },
        data: {
          usageCount: { decrement: 1 },
        },
      });
    }

    // Add new tags
    if (toAdd.length > 0) {
      await this.addTagsToPost(postId, toAdd);
    }
  }

  private calculateReadingTime(content: string): number {
    // Average reading speed: 200 words per minute
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  }

  async addImageToPost(postId: string, imageUrl: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with id "${postId}" not found`);
    }

    return this.prisma.blogPostImage.create({
      data: {
        postId,
        imageUrl,
      },
    });
  }

  async deleteImageFromPost(postId: string, imageId: string) {
    const image = await this.prisma.blogPostImage.findUnique({
      where: { id: imageId },
    });

    if (!image) {
      throw new NotFoundException(`Image with id "${imageId}" not found`);
    }

    if (image.postId !== postId) {
      throw new BadRequestException('Image does not belong to this post');
    }

    await this.prisma.blogPostImage.delete({
      where: { id: imageId },
    });

    return { success: true };
  }

  private formatPostResponse(post: any) {
    return {
      ...post,
      tags: post.tags.map((pt: any) => pt.tag),
      images: post.images,
    };
  }

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
      tags: post.tags.map((pt: any) => pt.tag),
      images: post.images,
    };
  }
}

