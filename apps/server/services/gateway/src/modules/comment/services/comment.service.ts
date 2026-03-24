import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '@server/shared';

import type {
  CommentCreateDTO,
  CommentQueryDTO,
  CommentResponseDTO,
  CommentPaginatedResponse,
  CommentUpdateDTO,
} from '@workspace/schemas';

@Injectable()
export class CommentService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  private hasStaffOverride(permissions?: string[]): boolean {
    if (!permissions?.length) return false;
    // Staff/admin can bypass enrollment checks
    return (
      permissions.includes('*') ||
      permissions.includes('academy.delivery.write') ||
      permissions.includes('academy.delivery.read') ||
      permissions.includes('academy.content.write') ||
      permissions.includes('academy.content.read')
    );
  }

  private toCommentDTO(
    comment: any,
    currentUserId?: string,
    replyCountOverride?: number,
  ): CommentResponseDTO {
    const likes = Array.isArray(comment.likes) ? comment.likes : [];
    const isLiked = !!currentUserId && likes.length > 0;

    const replyCount = replyCountOverride ?? comment?._count?.replies ?? 0;
    const likeCount = comment?._count?.likes ?? 0;

    return {
      id: comment.id,
      userId: comment.userId,
      parentCommentId: comment.parentCommentId ?? null,
      content: comment.content,
      status: comment.status,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      author: comment.user
        ? {
            id: comment.user.id,
            displayName: comment.user.displayName,
            avatarUrl: comment.user.avatarUrl ?? undefined,
          }
        : undefined,
      replyCount,
      likeCount,
      isLiked,
      replies: [],
    } as any;
  }

  private async buildNestedReplies(
    parentId: string,
    depth: number,
    currentUserId?: string,
  ): Promise<CommentResponseDTO[]> {
    if (depth <= 0) return [];

    const replies = await this.prisma.comment.findMany({
      where: {
        parentCommentId: parentId,
        status: { not: 'deleted' },
      },
      orderBy: { createdAt: 'asc' },
      include: {
        user: true,
        _count: { select: { replies: true, likes: true } },
        ...(currentUserId
          ? {
              likes: {
                where: { userId: currentUserId },
              },
            }
          : {}),
      },
    });

    return Promise.all(
      replies.map(async (reply: any) => {
        const dto = this.toCommentDTO(reply, currentUserId);
        dto.replies = await this.buildNestedReplies(
          reply.id,
          depth - 1,
          currentUserId,
        );
        return dto;
      }),
    );
  }

  /**
   * Resolve candidate course classes for DISCUSSION entity.
   *
   * Legacy mapping used by current UI:
   * - entityId can be:
   *   1) Class.id (course-level)
   *   2) Lesson.id (lesson-level)
   *   3) Topic comment id (nested replies UI) -> resolved via comment_targets(commentId=topicId,targetId=lessonId)
   */
  private async resolveClassIdsFromDiscussionEntity(
    targetType: string,
    entityId: string,
  ): Promise<string[]> {
    if (targetType !== 'DISCUSSION') {
      throw new BadRequestException(`Unsupported targetType=${targetType}`);
    }

    let current = entityId;
    for (let i = 0; i < 5; i++) {
      // 1) entityId is already a class id
      const klass = await this.prisma.liveClass.findUnique({
        where: { id: current },
        select: { id: true },
      });
      if (klass) return [klass.id];

      // 2) entityId is a lesson id -> map to all classes of the course profile
      const lesson = await this.prisma.lesson.findUnique({
        where: { id: current },
        select: { module: { select: { courseProfileId: true } } },
      });
      if (lesson?.module?.courseProfileId) {
        const classes = await this.prisma.liveClass.findMany({
          where: {
            cohort: { courseProfileId: lesson.module.courseProfileId },
          },
          select: { id: true },
        });
        if (classes.length) return classes.map((c) => c.id);
      }

      // 3) entityId is a topic comment id -> resolve targetId, then continue.
      const commentTarget = await this.prisma.commentTarget.findFirst({
        where: { commentId: current, targetType: 'DISCUSSION' },
        select: { targetId: true },
      });
      if (commentTarget) {
        current = commentTarget.targetId;
        continue;
      }

      break;
    }

    throw new NotFoundException(
      'Discussion target not found (cannot resolve course classes)',
    );
  }

  private async assertCanPostToDiscussion(
    requesterId: string,
    requesterPermissions: string[] | undefined,
    targetType: string,
    entityId: string,
  ): Promise<void> {
    if (this.hasStaffOverride(requesterPermissions)) return;

    const classIds = await this.resolveClassIdsFromDiscussionEntity(
      targetType,
      entityId,
    );

    if (!classIds.length) {
      throw new ForbiddenException('Bạn không được phép đăng thảo luận này');
    }

    const classes = await this.prisma.liveClass.findMany({
      where: { id: { in: classIds } },
      select: { instructorId: true },
    });

    // Instructor can always post.
    if (classes.some((c) => c.instructorId && c.instructorId === requesterId)) {
      return;
    }

    // Otherwise require enrollment in ANY candidate class.
    for (const classId of classIds) {
      const result = await firstValueFrom(
        this.natsClient.send(
          { cmd: 'academy.enrollment.checkEligibility' },
          {
            userId: requesterId,
            targetId: classId,
            targetType: 'CLASS',
          },
        ),
      );
      if (result?.isEnrolled) return;
    }

    throw new ForbiddenException('Bạn không được phép đăng thảo luận này');
  }

  async findAllComments(
    query: CommentQueryDTO,
    currentUserId?: string,
    requesterPermissions?: string[],
  ): Promise<CommentPaginatedResponse> {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const skip = (page - 1) * limit;

    if (!query.entityId || !query.targetType) {
      // keep consistent with current frontend: discussion always sends entityId+targetType
      throw new BadRequestException('entityId and targetType are required');
    }

    if (String(query.targetType) === 'DISCUSSION') {
      if (!currentUserId) {
        throw new ForbiddenException('Unauthorized');
      }
      await this.assertCanPostToDiscussion(
        currentUserId,
        requesterPermissions,
        query.targetType,
        query.entityId,
      );
    }

    const where: any = {
      status: { not: 'deleted' },
      targets: {
        some: {
          targetId: query.entityId,
          targetType: query.targetType,
        },
      },
    };

    if (query.parentId !== undefined) {
      where.parentCommentId = query.parentId || null;
    }

    const [rootComments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          _count: { select: { replies: true, likes: true } },
          ...(currentUserId
            ? {
                likes: { where: { userId: currentUserId } },
              }
            : {}),
        },
      }),
      this.prisma.comment.count({ where }),
    ]);

    const depth = 5; // enough for nested replies in CommentSection recursion

    const data: CommentResponseDTO[] = await Promise.all(
      rootComments.map(async (comment: any) => {
        const replyCount = comment?._count?.replies ?? 0;
        const dto = this.toCommentDTO(comment, currentUserId);

        // For lesson-discussion: show "ANSWERED" badge when there are answers.
        if (String(query.targetType) === 'DISCUSSION' && replyCount > 0) {
          dto.status = 'ANSWERED' as any;
        }

        dto.replies = await this.buildNestedReplies(
          comment.id,
          depth - 1,
          currentUserId,
        );
        return dto;
      }),
    );

    const totalPages = Math.ceil(total / limit) || 1;
    return {
      data,
      total,
      page,
      limit,
      totalPages,
    } as any;
  }

  async getReplies(
    commentId: string,
    depth: number,
    currentUserId?: string,
    requesterPermissions?: string[],
  ): Promise<CommentResponseDTO> {
    if (!currentUserId) {
      throw new ForbiddenException('Unauthorized');
    }

    if (requesterPermissions || currentUserId) {
      // For COURSE discussion replies, `commentId` (topic id) is also a DISCUSSION target source
      await this.assertCanPostToDiscussion(
        currentUserId,
        requesterPermissions,
        'DISCUSSION',
        commentId,
      );
    }

    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: true,
        _count: { select: { replies: true, likes: true } },
        ...(currentUserId
          ? { likes: { where: { userId: currentUserId } } }
          : {}),
      },
    });

    if (!comment || comment.status === 'deleted') {
      throw new NotFoundException('Comment not found');
    }

    const dto = this.toCommentDTO(comment, currentUserId);
    dto.replies = await this.buildNestedReplies(
      comment.id,
      Math.max(0, depth - 1),
      currentUserId,
    );
    return dto;
  }

  async createComment(
    dto: CommentCreateDTO,
    requesterId: string,
    requesterPermissions?: string[],
  ): Promise<CommentResponseDTO> {
    const targetType = dto.targetType;
    const entityId = dto.entityId;
    const parentId = dto.parentId;

    if (!targetType || !entityId) {
      throw new BadRequestException('targetType and entityId are required');
    }

    await this.assertCanPostToDiscussion(
      requesterId,
      requesterPermissions,
      targetType,
      entityId,
    );

    if (parentId) {
      const comment = await this.prisma.comment.create({
        data: {
          user: { connect: { id: requesterId } },
          content: dto.content,
          parent: { connect: { id: parentId } },
          status: 'approved',
        },
        include: {
          user: true,
          _count: { select: { replies: true, likes: true } },
          likes: { where: { userId: requesterId } },
        },
      });

      const dtoOut = this.toCommentDTO(comment as any, requesterId, 0);
      dtoOut.replies = [];
      return dtoOut;
    }

    const comment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.comment.create({
        data: {
          user: { connect: { id: requesterId } },
          content: dto.content,
          status: 'approved',
        },
        include: {
          user: true,
          _count: { select: { replies: true, likes: true } },
          likes: { where: { userId: requesterId } },
        },
      });

      await tx.commentTarget.create({
        data: {
          commentId: created.id,
          targetId: entityId,
          targetType: targetType as any,
        },
      });

      // Self-target: enables nested replies UI to query by `discussionId = topicCommentId`.
      // The topic comment will be found even when `entityId` is the topic's own id.
      await tx.commentTarget.create({
        data: {
          commentId: created.id,
          targetId: created.id,
          targetType: targetType as any,
        },
      });

      return created;
    });

    const dtoOut = this.toCommentDTO(comment as any, requesterId, 0);
    dtoOut.replies = [];
    return dtoOut;
  }

  async updateComment(
    commentId: string,
    dto: CommentUpdateDTO,
    requesterId: string,
  ): Promise<CommentResponseDTO> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        user: true,
        _count: { select: { replies: true, likes: true } },
        likes: { where: { userId: requesterId } },
      },
    });

    if (!comment || comment.status === 'deleted') {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== requesterId) {
      throw new ForbiddenException(
        'Bạn chỉ có thể chỉnh sửa bình luận của mình',
      );
    }

    const updated = await this.prisma.comment.update({
      where: { id: commentId },
      data: { content: dto.content },
      include: {
        user: true,
        _count: { select: { replies: true, likes: true } },
        likes: { where: { userId: requesterId } },
      },
    });

    const dtoOut = this.toCommentDTO(updated as any, requesterId);
    dtoOut.replies = [];
    return dtoOut;
  }

  async deleteComment(commentId: string, requesterId: string): Promise<void> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment || comment.status === 'deleted') {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId !== requesterId) {
      throw new ForbiddenException('Bạn chỉ có thể xóa bình luận của mình');
    }

    await this.prisma.comment.update({
      where: { id: commentId },
      data: { status: 'deleted', content: '[deleted]' },
    });
  }

  async toggleLike(
    commentId: string,
    requesterId: string,
  ): Promise<{ isLiked: boolean; likeCount: number }> {
    const existingLike = await this.prisma.commentLike.findUnique({
      where: {
        commentId_userId: {
          commentId,
          userId: requesterId,
        },
      },
    });

    if (existingLike) {
      await this.prisma.commentLike.delete({
        where: {
          commentId_userId: {
            commentId,
            userId: requesterId,
          },
        },
      });
    } else {
      await this.prisma.commentLike.create({
        data: {
          commentId,
          userId: requesterId,
        },
      });
    }

    const likeCount = await this.prisma.commentLike.count({
      where: { commentId },
    });

    return { isLiked: !existingLike, likeCount };
  }
}
