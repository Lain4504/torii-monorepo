import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
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

/**
 * comment Service
 * Handles business logic for comments
 */
@Injectable()
export class CommentService implements ICommentService {
  private readonly logger = new Logger(CommentService.name);

  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly prisma: PrismaService,
    @InjectMapper() private readonly mapper: Mapper,
  ) { }

  /**
   * Create new comment
   */
  async createComment(dto: CommentCreateDTO): Promise<CommentResponseDTO> {
    // Verify post exists
    const post = await this.prisma.post.findUnique({
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
      const parentComment = await this.commentRepository.findById(dto.parentId);

      if (!parentComment) {
        throw new NotFoundException(`Parent comment with id "${dto.parentId}" not found`);
      }

      // Ensure parent comment belongs to the same post
      if (parentComment.postId !== dto.postId) {
        throw new BadRequestException('Parent comment does not belong to this post');
      }
    }

    // Create comment
    const comment = await this.commentRepository.create({
      post: {
        connect: { id: dto.postId },
      },
      user: {
        connect: { id: dto.authorId },
      },
      content: dto.content,
      parent: dto.parentId ? {
        connect: { id: dto.parentId },
      } : undefined,
      status: 'approved',
    });

    // Increment comment count on the post
    await this.prisma.post.update({
      where: { id: dto.postId },
      data: {
        commentCount: {
          increment: 1,
        },
      },
    });

    return this.formatCommentResponse(comment);
  }

  /**
   * Find all comments with pagination and filters
   */
  async findAllComments(query: CommentQueryDTO): Promise<CommentPaginatedResponse> {
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
        }),
        this.commentRepository.count(where),
      ]);

      const formattedComments = await Promise.all(
        comments.map(async (comment: any) => {
          try {
            if (!comment || !comment.id) {
              this.logger.warn('Invalid comment data:', comment);
              return null;
            }
            
            const formatted = await this.formatCommentResponse(comment);
            return {
              ...formatted,
              replyCount: comment._count?.replies || 0,
            };
          } catch (error: any) {
            this.logger.error(`Error formatting comment ${comment?.id}: ${error.message}`, error.stack);
            // Return a basic formatted comment without author info if formatting fails
            // This ensures partial data is still returned even if one comment fails
            try {
              const basicDto = this.toCommentResponseDTO(comment);
              return {
                ...basicDto,
                replyCount: comment._count?.replies || 0,
                author: undefined,
              };
            } catch (fallbackError: any) {
              this.logger.error(`Fallback mapping also failed for comment ${comment?.id}: ${fallbackError.message}`);
              // Return minimal data to prevent complete failure
              return {
                id: comment?.id || 'unknown',
                postId: comment?.postId || '',
                userId: comment?.userId || '',
                authorId: comment?.userId || '',
                content: comment?.content || '',
                parentCommentId: comment?.parentCommentId || undefined,
                parentId: comment?.parentCommentId || undefined,
                likeCount: comment?.likes || 0,
                status: comment?.status || 'approved',
                isDeleted: comment?.status === 'deleted',
                isEdited: false,
                createdAt: comment?.createdAt || new Date(),
                updatedAt: comment?.updatedAt || new Date(),
                replyCount: comment._count?.replies || 0,
              } as CommentResponseDTO;
            }
          }
        }),
      );

      // Filter out null comments
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
      // Re-throw to let NestJS Exception Filter handle it
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

    const formatted = await this.formatCommentResponse(comment);
    return {
      ...formatted,
      replyCount: comment._count.replies,
    };
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

    // Verify the user is the author
    if (comment.userId !== authorId) {
      throw new BadRequestException('You can only edit your own comments');
    }

    const updatedComment = await this.commentRepository.update(id, {
      content: dto.content,
    });

    return this.formatCommentResponse(updatedComment);
  }

  /**
   * Delete comment (soft delete)
   */
  async deleteComment(id: string, authorId: string) {
    const comment = await this.commentRepository.findById(id);

    if (!comment) {
      throw new NotFoundException(`Comment with id "${id}" not found`);
    }

    // Verify the user is the author
    if (comment.userId !== authorId) {
      throw new BadRequestException('You can only delete your own comments');
    }

    // Soft delete
    await this.commentRepository.softDelete(id);

    // Decrement comment count on the post
    await this.prisma.post.update({
      where: { id: comment.postId },
      data: {
        commentCount: {
          decrement: 1,
        },
      },
    });

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

    const formatted = await this.formatCommentResponse(comment);

    // Recursively load replies
    const repliesWithNested = await Promise.all(
      comment.replies.map(async (reply) => {
        if (depth > 1) {
          return this.getCommentWithReplies(reply.id, depth - 1);
        }
        return this.formatCommentResponse(reply as Comment & { _count?: { replies?: number } });
      }),
    );

    return {
      ...formatted,
      replyCount: comment._count?.replies || 0,
      replies: repliesWithNested.filter((r) => r !== null) as CommentResponseDTO[],
    };
  }

  /**
   * Map Comment entity to CommentResponseDTO using AutoMapper
   */
  private toCommentResponseDTO(comment: Comment | (Comment & { _count?: { replies?: number } })): CommentResponseDTO {
    try {
      return this.mapper.map<any, CommentResponseDTO>(comment, 'Comment', 'CommentResponseDTO');
    } catch (error: any) {
      this.logger.error(`AutoMapper error for comment ${comment?.id}: ${error.message}`, error.stack);
      // Fallback: manual mapping if AutoMapper fails
      return {
        id: comment.id,
        postId: comment.postId,
        userId: comment.userId,
        authorId: comment.userId,
        content: comment.content,
        parentCommentId: comment.parentCommentId || undefined,
        parentId: comment.parentCommentId || undefined,
        likeCount: comment.likes || 0,
        status: comment.status,
        isDeleted: comment.status === 'deleted',
        isEdited: comment.updatedAt && comment.createdAt 
          ? comment.updatedAt.getTime() > comment.createdAt.getTime() + 1000 
          : false,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      } as CommentResponseDTO;
    }
  }

  /**
   * Format comment response with author info
   */
  private async formatCommentResponse(comment: Comment & { _count?: { replies?: number } }): Promise<CommentResponseDTO> {
    try {
      const dto = this.toCommentResponseDTO(comment);

      // Load author info separately
      if (comment.userId) {
        try {
          const user = await this.prisma.user.findUnique({
            where: { id: comment.userId },
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
          this.logger.warn(`Failed to fetch author info for comment ${comment.id}: ${error.message}`);
        }
      }

      // Add replyCount if available
      if (comment._count?.replies !== undefined) {
        dto.replyCount = comment._count.replies;
      }

      return dto;
    } catch (error: any) {
      this.logger.error(`Error in formatCommentResponse for comment ${comment?.id}: ${error.message}`, error.stack);
      throw error;
    }
  }
}



