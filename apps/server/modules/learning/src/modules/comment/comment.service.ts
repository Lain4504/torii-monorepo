import { Injectable, NotFoundException, BadRequestException, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
import { PrismaService } from '@server/shared';

import type {
  CommentCreateDTO,
  CommentUpdateDTO,
  CommentQueryDTO,
  CommentResponseDTO,
  CommentPaginatedResponse,
} from '@workspace/schemas';
// Import CommentTargetType from schemas or just use string checking if Prisma types aren't regenerated yet.
// Assuming CommentTargetType is in schemas or we compare with strings.
import { CommentTargetType } from '@workspace/schemas/src/models/comment.model';
import type { Comment, Prisma } from '@prisma/generated';
import type { ICommentService } from '@server/learning/interfaces/services';
import { CommentRepository } from '@server/learning/modules/comment/comment.repository';
import { BlogRepository } from '@server/learning/modules/blog/blog.repository';

/**
 * Comment Service
 * Handles business logic for comments
 */
@Injectable()
export class CommentService implements ICommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly blogRepository: BlogRepository,
    private readonly prisma: PrismaService,
    @InjectMapper() private readonly mapper: Mapper,
    @Inject('NATS_SERVICE')
    private readonly natsClient: ClientProxy,
  ) { }

  /**
   * Map Comment entity to CommentResponseDTO using AutoMapper
   */
  private toCommentResponseDTO(comment: any, currentUserId?: string): CommentResponseDTO {
    const dto = this.mapper.map<any, CommentResponseDTO>(comment, 'Comment', 'CommentResponseDTO');

    // Manually map author if user relation is loaded and author not already mapped by automapper
    if (comment.user && !dto.author) {
      dto.author = {
        id: comment.user.id,
        displayName: comment.user.displayName,
        avatarUrl: comment.user.avatarUrl,
      };
    }

    // Map replyCount, likeCount, isLiked
    dto.replyCount = comment._count?.replies || 0;
    dto.likeCount = comment._count?.likes || 0;

    if (currentUserId && comment.likes) {
      dto.isLiked = Array.isArray(comment.likes) && comment.likes.length > 0;
    }

    // Recursively map replies if present
    if (comment.replies && Array.isArray(comment.replies)) {
      dto.replies = comment.replies.map((reply: any) => ({
        ...this.toCommentResponseDTO(reply, currentUserId),
        // Ensure reply count/likes are mapped for nested items if they came from includeReplies
        replyCount: reply._count?.replies || 0,
        likeCount: reply._count?.likes || 0,
        isLiked: currentUserId && reply.likes ? (Array.isArray(reply.likes) && reply.likes.length > 0) : false
      }));
    }

    return dto;
  }

  /**
   * Create new comment
   */
  /**
   * Create new comment
   */
  async createComment(dto: CommentCreateDTO): Promise<CommentResponseDTO> {
    // Verify target entity exists if this is a root comment or validation is needed
    if (dto.targetType === 'BLOG' && !dto.parentId) {
      const blog = await this.prisma.blog.findUnique({
        where: { id: dto.entityId! },
      });

      if (!blog) {
        throw new NotFoundException(`Blog with id "${dto.entityId}" not found`);
      }
    } else if (dto.targetType === 'FEED' && !dto.parentId) {
      const feed = await this.prisma.feed.findUnique({
        where: { id: dto.entityId },
      });

      if (!feed) {
        throw new NotFoundException(`Feed with id "${dto.entityId}" not found`);
      }
    }

    // Check if author exists
    const user = await this.prisma.user.findUnique({
      where: { id: dto.authorId },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${dto.authorId}" not found`);
    }

    let parentComment: Comment | null = null;
    if (dto.parentId) {
      parentComment = await this.commentRepository.findById(dto.parentId);

      if (!parentComment) {
        throw new NotFoundException(`Parent comment with id "${dto.parentId}" not found`);
      }
      // Note: We don't strictly enforce parent target match here as finding parent Target requires extra query.
      // Assuming parentId is valid is enough for now.
    }

    let comment: Comment;

    if (dto.parentId) {
      // Reply: Just create the comment linked to parent
      comment = await this.commentRepository.create({
        user: { connect: { id: dto.authorId } },
        content: dto.content,
        parent: { connect: { id: dto.parentId } },
        status: 'approved',
      });
    } else {
      // Root comment: Create Comment + CommentTarget in transaction
      // Use the new repository method or direct prisma transaction
      comment = await this.commentRepository.createWithTarget(
        {
          user: { connect: { id: dto.authorId } },
          content: dto.content,
          status: 'approved',
        },
        {
          targetType: dto.targetType as any,
          targetId: dto.entityId!,
        }
      );
    }

    // Increment comment count logic 
    // Only increment if we can identify the target.
    // For root comments, we have dto.entityId. 
    // For replies, we might want to increment parent's target too, but that requires finding it.
    // User requirement: "tradeoff xíu đi". Let's increment if we have the info from DTO (user passes type/id even for replies?)
    // User said: "create comment hay create reply là truyền xuống 1 field type nữa". 
    // So current DTO has target info even for replies.

    if (dto.targetType === 'BLOG' && dto.entityId) {
      await this.blogRepository.update(dto.entityId, {
        commentCount: { increment: 1 },
      });
    } else if (dto.targetType === 'FEED') {
      try {
        await this.prisma.feed.update({
          where: { id: dto.entityId },
          data: { commentCount: { increment: 1 } }
        });
      } catch (e) {
        // Ignore
      }
    }

    // Notification Logic
    if (dto.parentId && parentComment) {
      try {
        const parentCommentAuthorId = parentComment.userId;
        const replyAuthorId = dto.authorId;

        if (parentCommentAuthorId !== replyAuthorId) {
          this.natsClient.emit(
            { cmd: 'send_notification' },
            {
              recipientId: parentCommentAuthorId,
              type: 'COMMENT_REPLY',
              payload: {
                title: 'New reply to your comment',
                body: `Someone replied to your comment`,
                metadata: {
                  commentId: comment.id,
                  entityId: dto.entityId,
                  targetType: dto.targetType,
                  parentCommentId: dto.parentId,
                  replyAuthorId: replyAuthorId,
                },
              },
            },
          );
        }
      } catch (error: any) {
        this.logger.error(`Failed to emit event: ${error?.message}`);
      }
    }

    return this.toCommentResponseDTO(comment, dto.authorId);
  }

  /**
   * Find all comments with pagination and filters
   */
  async findAllComments(query: CommentQueryDTO, currentUserId?: string): Promise<CommentPaginatedResponse> {
    try {
      const page = typeof query.page === 'string' ? parseInt(query.page, 10) : (query.page || 1);
      const limit = typeof query.limit === 'string' ? parseInt(query.limit, 10) : (query.limit || 20);
      const skip = (page - 1) * limit;

      // Base filtered by status
      const where: Prisma.CommentWhereInput = {
        status: { not: 'deleted' },
      };

      // Filter by Target (Polymorphic)
      // Only root comments usually have targets directly attached in this schema design 
      // (replies are linked to parent).
      // However, if we want all comments for a blog, we generally fetch Roots + include Replies.
      if (query.entityId && query.targetType) {
        where.targets = {
          some: {
            targetId: query.entityId,
            targetType: query.targetType as any,
          }
        };
      }

      if (query.parentId !== undefined) {
        where.parentCommentId = query.parentId || null;
      }

      const orderBy: Prisma.CommentOrderByWithRelationInput = {};
      if (query.sortBy) {
        orderBy[query.sortBy] = query.sortOrder || 'desc';
      } else {
        orderBy.createdAt = 'desc';
      }

      const [comments, total] = await Promise.all([
        this.commentRepository.findMany({
          where,
          skip,
          take: limit,
          orderBy,
          includeReplyCount: true,
          includeReplies: true, // Fetch nested replies
          currentUserId,
        }),
        this.commentRepository.count(where),
      ]);

      const formattedComments = await Promise.all(
        comments.map(async (comment: any) => {
          return this.toCommentResponseDTO(comment, currentUserId);
        }),
      );

      const validComments = formattedComments.filter((c): c is CommentResponseDTO => c !== null);

      return {
        data: validComments,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      this.logger.error(`Error in findAllComments: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Find comment by ID
   */
  async findCommentById(id: string): Promise<CommentResponseDTO> {
    const comment = await this.commentRepository.findByIdWithReplyCount(id);

    if (!comment) {
      throw new NotFoundException(`Comment with id "${id}" not found`);
    }

    return this.toCommentResponseDTO(comment);
  }

  /**
   * Update comment
   */
  async updateComment(id: string, authorId: string, dto: CommentUpdateDTO): Promise<CommentResponseDTO> {
    const comment = await this.commentRepository.findById(id);

    if (!comment) {
      throw new NotFoundException(`Comment with id "${id}" not found`);
    }

    if (comment.status === 'deleted') {
      throw new BadRequestException(`Cannot update a deleted comment`);
    }

    if (comment.userId !== authorId) {
      throw new BadRequestException('You can only edit your own comments');
    }

    const updatedComment = await this.commentRepository.update(id, {
      content: dto.content,
    });

    return this.toCommentResponseDTO(updatedComment, authorId);
  }

  /**
   * Delete comment (soft delete)
   */
  async deleteComment(id: string, authorId: string) {
    const comment = await this.commentRepository.findById(id);

    if (!comment) {
      throw new NotFoundException(`Comment with id "${id}" not found`);
    }

    if (comment.userId !== authorId) {
      throw new BadRequestException('You can only delete your own comments');
    }

    await this.commentRepository.softDelete(id);

    // Cast to any because targetType/entityId might not be in generic Comment type yet
    const targetType = (comment as any).targetType;
    const entityId = (comment as any).entityId;

    if (targetType === 'BLOG' && entityId) {
      await this.blogRepository.update(entityId, {
        commentCount: { decrement: 1 },
      });
    } else if (targetType === 'FEED') {
      try {
        await this.prisma.feed.update({
          where: { id: entityId },
          data: { commentCount: { decrement: 1 } }
        });
      } catch (e) {
        // Ignore
      }
    }

    return { success: true, message: 'Comment deleted successfully' };
  }

  /**
   * Get comment with nested replies
   */
  async getCommentWithReplies(commentId: string, depth: number = 2): Promise<CommentResponseDTO | null> {
    if (depth <= 0) {
      return null;
    }

    const comment = await this.commentRepository.findWithReplies(commentId);

    if (!comment || comment.status === 'deleted') {
      return null;
    }

    const formatted = this.toCommentResponseDTO(comment);

    // Recursively load replies
    const repliesWithNested = await Promise.all(
      comment.replies.map(async (reply: any) => {
        if (depth > 1) {
          return this.getCommentWithReplies(reply.id, depth - 1);
        }
        return this.toCommentResponseDTO({
          ...reply,
          _count: reply._count || { replies: 0, likes: 0 }
        } as any);
      }),
    );

    return {
      ...formatted,
      replies: repliesWithNested.filter((r) => r !== null) as CommentResponseDTO[],
    };
  }

  /**
   * Toggle Like Comment
   */
  async toggleLike(commentId: string, userId: string): Promise<{ isLiked: boolean; likeCount: number }> {
    const existingLike = await this.prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId,
        },
      },
    });

    if (existingLike) {
      await this.prisma.commentLike.delete({
        where: {
          commentId_userId: {
            commentId,
            userId,
          },
        },
      });
    } else {
      await this.prisma.commentLike.create({
        data: {
          commentId,
          userId,
        },
      });
    }

    const likeCount = await this.prisma.commentLike.count({
      where: { commentId },
    });

    return { isLiked: !existingLike, likeCount };
  }
}

