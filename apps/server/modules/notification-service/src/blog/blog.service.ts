import { Injectable, NotFoundException, BadRequestException, Logger, Inject } from '@nestjs/common';
import { PrismaService, SUPABASE_CLIENT, generateSlug } from '@server/shared';
import { SupabaseClient } from '@supabase/supabase-js';
import {
  CreateBlogPostDto,
  UpdateBlogPostDto,
  BlogPostQueryDto,
  BlogPostStatus,
  CreateBlogCommentDto,
  UpdateBlogCommentDto,
  BlogCommentQueryDto,
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
  // BLOG COMMENT METHODS
  // =========================

  async createComment(dto: CreateBlogCommentDto) {
    // Verify post exists
    const post = await this.prisma.blogPost.findUnique({
      where: { id: dto.postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with id "${dto.postId}" not found`);
    }

    // Check if author exists in Supabase Auth
    const { data: user, error } = await this.supabase.auth.admin.getUserById(
      dto.authorId,
    );

    if (error || !user) {
      throw new NotFoundException(`User with id "${dto.authorId}" not found in Supabase Auth`);
    }

    // If parentId is provided, verify parent comment exists
    if (dto.parentId) {
      const parentComment = await this.prisma.blogComment.findUnique({
        where: { id: dto.parentId },
      });

      if (!parentComment) {
        throw new NotFoundException(`Parent comment with id "${dto.parentId}" not found`);
      }

      // Ensure parent comment belongs to the same post
      if (parentComment.postId !== dto.postId) {
        throw new BadRequestException('Parent comment does not belong to this post');
      }
    }

    // Create comment
    const comment = await this.prisma.blogComment.create({
      data: {
        postId: dto.postId,
        userId: dto.authorId, // Changed from authorId to userId
        content: dto.content,
        parentCommentId: dto.parentId, // Changed from parentId to parentCommentId
        status: 'approved', // Default status
      },
    });

    // Increment comment count on the post
    await this.prisma.blogPost.update({
      where: { id: dto.postId },
      data: {
        commentCount: {
          increment: 1,
        },
      },
    });

    return this.formatCommentResponseWithSupabaseAuthor(comment);
  }

  async findAllComments(query: BlogCommentQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      status: { not: 'deleted' }, // Don't return deleted comments
    };

    if (query.postId) {
      where.postId = query.postId;
    }

    // Filter by parentCommentId (null = top-level comments, specific ID = replies to that comment)
    if (query.parentId !== undefined) {
      where.parentCommentId = query.parentId || null;
    }

    const orderBy: any = {};
    if (query.sortBy) {
      orderBy[query.sortBy] = query.sortOrder || 'desc';
    } else {
      orderBy.createdAt = 'desc';
    }

    const [comments, total] = await Promise.all([
      this.prisma.blogComment.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: { replies: true },
          },
        },
      }),
      this.prisma.blogComment.count({ where }),
    ]);

    const formattedComments = await Promise.all(
      comments.map(async (comment) => {
        const formatted = await this.formatCommentResponseWithSupabaseAuthor(comment);
        return {
          ...formatted,
          replyCount: comment._count.replies,
        };
      }),
    );

    return {
      data: formattedComments,
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

  async findCommentById(id: string) {
    const comment = await this.prisma.blogComment.findUnique({
      where: { id },
      include: {
        _count: {
          select: { replies: true },
        },
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with id "${id}" not found`);
    }

    const formatted = await this.formatCommentResponseWithSupabaseAuthor(comment);
    return {
      ...formatted,
      replyCount: comment._count.replies,
    };
  }

  async updateComment(id: string, authorId: string, dto: UpdateBlogCommentDto) {
    const comment = await this.prisma.blogComment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with id "${id}" not found`);
    }

    if (comment.status === 'deleted') {
      throw new BadRequestException(`Cannot update a deleted comment`);
    }

    // Verify the user is the author
    if (comment.userId !== authorId) {
      throw new BadRequestException('You can only edit your own comments');
    }

    const updatedComment = await this.prisma.blogComment.update({
      where: { id },
      data: {
        content: dto.content,
      },
    });

    return this.formatCommentResponseWithSupabaseAuthor(updatedComment);
  }

  async deleteComment(id: string, authorId: string) {
    const comment = await this.prisma.blogComment.findUnique({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException(`Comment with id "${id}" not found`);
    }

    // Verify the user is the author
    if (comment.userId !== authorId) {
      throw new BadRequestException('You can only delete your own comments');
    }

    // Soft delete - mark as deleted instead of removing from database
    await this.prisma.blogComment.update({
      where: { id },
      data: {
        status: 'deleted',
        content: '[deleted]', // Replace content
      },
    });

    // Decrement comment count on the post
    await this.prisma.blogPost.update({
      where: { id: comment.postId },
      data: {
        commentCount: {
          decrement: 1,
        },
      },
    });

    return { success: true, message: 'Comment deleted successfully' };
  }

  // Get comment with nested replies (recursive)
  async getCommentWithReplies(commentId: string, depth: number = 2) {
    if (depth <= 0) {
      return null;
    }

    const comment = await this.prisma.blogComment.findUnique({
      where: { id: commentId },
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

    if (!comment || comment.status === 'deleted') {
      return null;
    }

    const formatted = await this.formatCommentResponseWithSupabaseAuthor(comment);
    
    // Recursively load replies
    const repliesWithNested = await Promise.all(
      comment.replies.map(async (reply) => {
        if (depth > 1) {
          return this.getCommentWithReplies(reply.id, depth - 1);
        }
        return this.formatCommentResponseWithSupabaseAuthor(reply);
      }),
    );

    return {
      ...formatted,
      replyCount: comment._count.replies,
      replies: repliesWithNested.filter((r) => r !== null),
    };
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

  private async formatCommentResponseWithSupabaseAuthor(comment: any) {
    // Get author info from Supabase
    let authorInfo: { id: string; fullName: string; avatarUrl: string | null } | null = null;
    
    if (comment.userId) {
      try {
        const { data: user, error } = await this.supabase.auth.admin.getUserById(
          comment.userId,
        );
        if (user && user.user) {
          authorInfo = {
            id: user.user.id,
            fullName: user.user.user_metadata?.full_name || user.user.user_metadata?.name || user.user.email || 'Unknown',
            avatarUrl: user.user.user_metadata?.avatar_url || null,
          };
        }
      } catch (error: any) {
        // Silent fail - continue without author info
      }
    }

    return {
      id: comment.id,
      postId: comment.postId,
      authorId: comment.userId, // Map userId to authorId in response
      author: authorInfo,
      content: comment.content,
      parentId: comment.parentCommentId, // Map parentCommentId to parentId in response
      likeCount: comment.likes, // Map likes to likeCount in response
      isEdited: false, // Removed from schema, always return false
      isDeleted: comment.status === 'deleted', // Map status to isDeleted in response
      status: comment.status, // Include status field
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }
}

