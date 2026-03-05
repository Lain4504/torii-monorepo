import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { Comment, Prisma } from '@prisma/generated';
import type { ICommentRepository } from '@server/learning/interfaces/repositories';

/**
 * Comment Repository
 * Handles all database operations for Comment entity
 */
@Injectable()
export class CommentRepository implements ICommentRepository {
  private readonly logger = new Logger(CommentRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find comment by ID
   */
  async findById(id: string): Promise<Comment | null> {
    return this.prisma.comment.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  /**
   * Find comment by ID with reply count
   */
  async findByIdWithReplyCount(
    id: string,
  ): Promise<(Comment & { _count: { replies: number } }) | null> {
    return this.prisma.comment.findUnique({
      where: { id },
      include: {
        user: true,
        _count: {
          select: { replies: true, likes: true },
        },
      },
    });
  }

  /**
   * Find all comments with pagination and filters
   */
  async findMany(options: {
    skip: number;
    take: number;
    where?: Prisma.CommentWhereInput;
    orderBy?: Prisma.CommentOrderByWithRelationInput;
    includeReplyCount?: boolean;
    currentUserId?: string;
    includeReplies?: boolean; // New option
  }): Promise<
    (Comment & { _count?: { replies?: number }; replies?: any[] })[]
  > {
    return this.prisma.comment.findMany({
      where: options.where,
      skip: options.skip,
      take: options.take,
      orderBy: options.orderBy || { createdAt: 'desc' },
      include: {
        user: true, // Always include author
        ...(options.includeReplyCount
          ? {
              _count: {
                select: { replies: true, likes: true },
              },
            }
          : {}),
        ...(options.includeReplies
          ? {
              replies: {
                where: { status: { not: 'deleted' } },
                orderBy: { createdAt: 'asc' },
                include: {
                  user: true,
                  _count: { select: { likes: true } },
                  ...(options.currentUserId
                    ? {
                        likes: {
                          where: { userId: options.currentUserId },
                        },
                      }
                    : {}),
                },
              },
            }
          : {}),
        ...(options.currentUserId
          ? {
              likes: {
                where: { userId: options.currentUserId },
              },
            }
          : {}),
      },
    }) as Promise<
      (Comment & {
        _count?: { replies: number; likes: number };
        likes?: any[];
        replies?: any[];
      })[]
    >;
  }

  /**
   * Count comments with optional filter
   */
  async count(where?: Prisma.CommentWhereInput): Promise<number> {
    return this.prisma.comment.count({ where });
  }

  /**
   * Create new comment
   */
  async create(data: Prisma.CommentCreateInput): Promise<Comment> {
    return this.prisma.comment.create({
      data,
      include: { user: true },
    });
  }

  /**
   * Create comment with target (Transaction)
   */
  async createWithTarget(
    data: Prisma.CommentCreateInput,
    target: { targetType: any; targetId: string }, // Type 'any' for enum avoiding circular deps if needed
  ): Promise<Comment> {
    return this.prisma.$transaction(async (tx) => {
      const comment = await tx.comment.create({
        data,
        include: { user: true },
      });

      await tx.commentTarget.create({
        data: {
          commentId: comment.id,
          targetType: target.targetType,
          targetId: target.targetId,
        },
      });

      return comment;
    });
  }

  /**
   * Update comment by ID
   */
  async update(id: string, data: Prisma.CommentUpdateInput): Promise<Comment> {
    return this.prisma.comment.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      include: { user: true },
    });
  }

  /**
   * Soft delete comment
   */
  async softDelete(id: string): Promise<Comment> {
    return this.prisma.comment.update({
      where: { id },
      data: {
        status: 'deleted',
        content: '[deleted]',
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Find comment with nested replies
   */
  async findWithReplies(
    id: string,
  ): Promise<
    (Comment & { replies: Comment[]; _count: { replies: number } }) | null
  > {
    return this.prisma.comment.findUnique({
      where: { id },
      include: {
        user: true,
        replies: {
          where: { status: { not: 'deleted' } },
          orderBy: { createdAt: 'asc' },
          include: { user: true, _count: { select: { likes: true } } },
        },
        _count: {
          select: { replies: true, likes: true },
        },
      },
    });
  }
}
