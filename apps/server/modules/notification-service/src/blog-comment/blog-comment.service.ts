import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import {
  CreateBlogCommentDto,
  UpdateBlogCommentDto,
  BlogCommentQueryDto,
} from '@workspace/dtos';

@Injectable()
export class BlogCommentService {
  private readonly logger = new Logger(BlogCommentService.name);

  constructor(
    private readonly prisma: PrismaService,
  ) { }

  async createComment(dto: CreateBlogCommentDto) {
    // Verify post exists
    const post = await this.prisma.blogPost.findUnique({
      where: { id: dto.postId },
    });

    if (!post) {
      throw new NotFoundException(`Post with id "${dto.postId}" not found`);
    }

    // Check if author exists in User table
    const user = await this.prisma.user.findUnique({
      where: { id: dto.authorId },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${dto.authorId}" not found`);
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
        userId: dto.authorId,
        content: dto.content,
        parentCommentId: dto.parentId,
        status: 'approved',
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

    return this.formatCommentResponse(comment);
  }

  async findAllComments(query: BlogCommentQueryDto) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {
      status: { not: 'deleted' },
    };

    if (query.postId) {
      where.postId = query.postId;
    }

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
        const formatted = await this.formatCommentResponse(comment);
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

    const formatted = await this.formatCommentResponse(comment);
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

    return this.formatCommentResponse(updatedComment);
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

    // Soft delete
    await this.prisma.blogComment.update({
      where: { id },
      data: {
        status: 'deleted',
        content: '[deleted]',
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

    const formatted = await this.formatCommentResponse(comment);

    // Recursively load replies
    const repliesWithNested = await Promise.all(
      comment.replies.map(async (reply) => {
        if (depth > 1) {
          return this.getCommentWithReplies(reply.id, depth - 1);
        }
        return this.formatCommentResponse(reply);
      }),
    );

    return {
      ...formatted,
      replyCount: comment._count.replies,
      replies: repliesWithNested.filter((r) => r !== null),
    };
  }

  private async formatCommentResponse(comment: any) {
    // Get author info from User table
    let authorInfo: { id: string; fullName: string; email: string } | null = null;

    if (comment.userId) {
      try {
        const user = await this.prisma.user.findUnique({
          where: { id: comment.userId },
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        });

        if (user) {
          authorInfo = {
            id: user.id,
            fullName: user.fullName || user.email || 'Unknown',
            email: user.email,
          };
        }
      } catch (error: any) {
        // Silent fail
      }
    }

    return {
      id: comment.id,
      postId: comment.postId,
      authorId: comment.userId,
      author: authorInfo,
      content: comment.content,
      parentId: comment.parentCommentId,
      likeCount: comment.likes,
      isEdited: false,
      isDeleted: comment.status === 'deleted',
      status: comment.status,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  }
}
