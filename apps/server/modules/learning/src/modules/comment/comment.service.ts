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
import type { Comment, Prisma } from '@prisma/generated';
import type { ICommentService } from '../../interfaces/services';
import { CommentRepository } from './comment.repository';
import { PostRepository } from '../post/post.repository';

/**
 * Comment Service
 * Handles business logic for comments
 */
@Injectable()
export class CommentService implements ICommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly postRepository: PostRepository,
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

    return dto;
  }

  /**
   * Create new comment
   */
  async createComment(dto: CommentCreateDTO): Promise<CommentResponseDTO> {
    // Verify post or qa exists
    if (dto.postId) {
      const post = await this.prisma.post.findUnique({
        where: { id: dto.postId },
      });

      if (!post) {
        throw new NotFoundException(`Post with id "${dto.postId}" not found`);
      }
    } else if (dto.qaId) {
      const qa = await this.prisma.qA.findUnique({
        where: { id: dto.qaId },
      });

      if (!qa) {
        throw new NotFoundException(`QA with id "${dto.qaId}" not found`);
      }
    } else {
      throw new BadRequestException('Either postId or qaId must be provided');
    }

    // Check if author exists in User table
    const user = await this.prisma.user.findUnique({
      where: { id: dto.authorId },
    });

    if (!user) {
      throw new NotFoundException(`User with id "${dto.authorId}" not found`);
    }

    // If parentId is provided, verify parent comment exists
    let parentComment: Comment | null = null;
    if (dto.parentId) {
      parentComment = await this.commentRepository.findById(dto.parentId);

      if (!parentComment) {
        throw new NotFoundException(`Parent comment with id "${dto.parentId}" not found`);
      }

      // Ensure parent comment belongs to the same post/qa
      if (dto.postId && parentComment.postId !== dto.postId) {
        throw new BadRequestException('Parent comment does not belong to this post');
      }
      if (dto.qaId && parentComment.qaId !== dto.qaId) {
        throw new BadRequestException('Parent comment does not belong to this QA');
      }
    }

    const comment = await this.commentRepository.create({
      post: dto.postId ? {
        connect: { id: dto.postId },
      } : undefined,
      qa: dto.qaId ? {
        connect: { id: dto.qaId },
      } : undefined,
      user: {
        connect: { id: dto.authorId },
      },
      content: dto.content,
      parent: dto.parentId ? {
        connect: { id: dto.parentId },
      } : undefined,
      status: 'approved',
    });

    // Increment comment count
    if (dto.postId) {
      await this.postRepository.update(dto.postId, {
        commentCount: { increment: 1 },
      });
    } else if (dto.qaId) {
      try {
        await this.prisma.qA.update({
          where: { id: dto.qaId },
          data: { commentCount: { increment: 1 } }
        });
      } catch (e) {
        // Ignore
      }
    }

    // If this is a reply (parentId exists), emit event to notify the person being replied to
    if (dto.parentId && parentComment) {
      try {
        const parentCommentAuthorId = parentComment.userId;
        const replyAuthorId = dto.authorId;
        const isReplyingSelf = parentCommentAuthorId === replyAuthorId;

        if (!isReplyingSelf) {
          this.logger.log(`Emitting send_notification event for comment reply ${comment.id} - Replied to user: ${parentCommentAuthorId}`);
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
                  postId: dto.postId,
                  parentCommentId: dto.parentId,
                  replyAuthorId: replyAuthorId,
                },
              },
            },
          );
        }
      } catch (error: any) {
        this.logger.error(`Failed to emit comment.reply event: ${error?.message}`, error);
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

      const where: Prisma.CommentWhereInput = {
        status: { not: 'deleted' },
      };

      if (query.postId) {
        where.postId = query.postId;
      }
      if (query.qaId) {
        where.qaId = query.qaId;
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
          currentUserId,
        }),
        this.commentRepository.count(where),
      ]);

      const formattedComments = await Promise.all(
        comments.map(async (comment: any) => {
          try {
            if (!comment || !comment.id) {
              return null;
            }
            return this.toCommentResponseDTO(comment, currentUserId);
          } catch (error: any) {
            this.logger.error(`Error formatting comment ${comment?.id}: ${error.message}`);
            // Fallback
            try {
              const basicDto = this.toCommentResponseDTO(comment, currentUserId);
              return {
                ...basicDto,
                replyCount: comment._count?.replies || 0,
                author: undefined,
              };
            } catch (fallbackError) {
              return null;
            }
          }
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

    if (comment.postId) {
      await this.postRepository.update(comment.postId, {
        commentCount: { decrement: 1 },
      });
    } else if (comment.qaId) {
      try {
        await this.prisma.qA.update({
          where: { id: comment.qaId },
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
