import { Injectable, Logger, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { Notification } from '@prisma/generated';
import {
  NotificationResponseDTO,
  NotificationQueryDTO,
  NotificationCreateDTO,
  NotificationUnreadCountResponseDTO,
  PaginatedResponseDTO,
} from '@workspace/schemas';
import type { INotificationService } from '../../interfaces/services';
import type { INotificationRepository } from '../../interfaces/repositories';
import { NOTIFICATION_REPOSITORY_TOKEN } from '../../interfaces/repositories';

@Injectable()
export class NotificationService implements INotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @Inject(NOTIFICATION_REPOSITORY_TOKEN)
    private readonly notificationRepository: INotificationRepository,
    private readonly prisma: PrismaService, // Still needed for cross-service queries (post, user, wishlist)
  ) { }

  /**
   * Map Notification entity to NotificationResponseDto
   */
  private toNotificationResponseDto(
    notification: Notification,
  ): NotificationResponseDTO {
    return {
      id: notification.id,
      userId: notification.userId,
      title: notification.title,
      message: notification.message,
      notificationType: notification.notificationType as any,
      metadata: notification.metadata || undefined,
      isRead: notification.isRead,
      readAt: notification.readAt || undefined,
      sentVia: notification.sentVia || [],
      createdAt: notification.createdAt,
    };
  }

  /**
   * Get all notifications for a user with pagination and filtering
   */
  async findAll(
    userId: string,
    query: NotificationQueryDTO,
  ): Promise<PaginatedResponseDTO<NotificationResponseDTO>> {
    try {
      const { page = 1, limit = 10, isRead } = query;
      const pageNum = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
      const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;
      const validPage = pageNum > 0 ? pageNum : 1;
      const validLimit = limitNum > 0 ? limitNum : 10;
      const skip = (validPage - 1) * validLimit;

      const whereClause: Record<string, any> = {
        userId,
      };

      // Filter by read status if provided
      // Convert string to boolean if needed (query params come as strings)
      if (isRead !== undefined) {
        // Handle string values from query params
        if (typeof isRead === 'string') {
          whereClause.isRead = isRead === 'true' || isRead === '1';
        } else {
          whereClause.isRead = Boolean(isRead);
        }
      }

      const [total, notifications] = await Promise.all([
        this.notificationRepository.count(whereClause),
        this.notificationRepository.findMany({
          skip,
          take: validLimit,
          where: whereClause,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      const totalPages = Math.ceil(total / validLimit);

      return {
        data: notifications.map((n) => this.toNotificationResponseDto(n)),
        total,
        page: validPage,
        limit: validLimit,
        totalPages,
      };
    } catch (error: any) {
      this.logger.error('Failed to retrieve notifications', error);
      throw new BadRequestException(`Failed to retrieve notifications: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<NotificationResponseDTO> {
    try {
      // Verify notification exists and belongs to user
      const existing = await this.notificationRepository.findByIdAndUserId(notificationId, userId);

      if (!existing) {
        throw new NotFoundException(`Notification with id ${notificationId} not found`);
      }

      // Update notification
      const notification = await this.notificationRepository.update(notificationId, {
        isRead: true,
        readAt: new Date(),
      });

      return this.toNotificationResponseDto(notification);
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error marking notification as read', error);
      throw new BadRequestException(`Failed to mark notification as read: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<{ success: boolean; message: string; count: number }> {
    try {
      const result = await this.notificationRepository.updateMany(
        {
          userId,
          isRead: false,
        },
        {
          isRead: true,
          readAt: new Date(),
        },
      );

      return {
        success: true,
        message: `${result.count} notification(s) marked as read`,
        count: result.count,
      };
    } catch (error: any) {
      this.logger.error('Error marking all notifications as read', error);
      throw new BadRequestException(`Failed to mark all notifications as read: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<NotificationUnreadCountResponseDTO> {
    try {
      const count = await this.notificationRepository.count({
        userId,
        isRead: false,
      });

      return {
        count,
      };
    } catch (error: any) {
      this.logger.error('Error getting unread count', error);
      throw new BadRequestException(`Failed to get unread count: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Delete a notification
   */
  async delete(notificationId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Verify notification exists and belongs to user
      const existing = await this.notificationRepository.findByIdAndUserId(notificationId, userId);

      if (!existing) {
        throw new NotFoundException(`Notification with id ${notificationId} not found`);
      }

      // Hard delete the notification
      await this.notificationRepository.delete(notificationId);

      return {
        success: true,
        message: 'Notification deleted successfully',
      };
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error deleting notification', error);
      throw new BadRequestException(`Failed to delete notification: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Create a notification (for event-driven use cases)
   */
  async create(data: NotificationCreateDTO): Promise<NotificationResponseDTO> {
    try {
      const notification = await this.notificationRepository.create({
        userId: data.userId,
        title: data.title,
        message: data.message,
        notificationType: data.notificationType,
        metadata: data.metadata || null,
        sentVia: data.sentVia || ['in_app'],
        isRead: false,
      });

      return this.toNotificationResponseDto(notification);
    } catch (error: any) {
      this.logger.error('Error creating notification', error);
      throw new BadRequestException(`Failed to create notification: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Handle course published event - create notifications for interested learners
   */
  async handleCoursePublished(payload: {
    courseId: string;
    courseTitle: string;
    courseJlptLevel: string;
    userIds?: string[]; // Optional: specific user IDs to notify
  }): Promise<void> {
    try {
      this.logger.log(`Handling course published event for course: ${payload.courseId}`);

      let userIdsToNotify: string[] = [];

      // If specific user IDs provided, use them (preferred method)
      if (payload.userIds && payload.userIds.length > 0) {
        userIdsToNotify = payload.userIds;
        this.logger.log(`Using provided user IDs: ${userIdsToNotify.length} users`);
      } else {
        // Fallback: Query from wishlist
        try {
          const wishlistUsers = await this.prisma.$queryRaw<Array<{ user_id: string }>>`
            SELECT DISTINCT user_id 
            FROM wishlist 
            WHERE course_id = ${payload.courseId}::uuid
          `;
          userIdsToNotify = wishlistUsers.map((w) => w.user_id);
          this.logger.log(`Found ${userIdsToNotify.length} users from wishlist`);
        } catch (error: any) {
          this.logger.warn(`Failed to query wishlist: ${error?.message}`);
          // If wishlist query fails, skip notification creation
          userIdsToNotify = [];
        }
      }

      if (userIdsToNotify.length === 0) {
        this.logger.log('No users to notify for this course');
        return;
      }

      // Create notifications for all interested users
      const notifications = userIdsToNotify.map((userId) => ({
        userId,
        title: 'Khóa học mới đã được phát hành',
        message: `Khóa học "${payload.courseTitle}" đã được phát hành và sẵn sàng để bạn học tập!`,
        notificationType: 'course' as const,
        metadata: {
          courseId: payload.courseId,
          courseTitle: payload.courseTitle,
          courseJlptLevel: payload.courseJlptLevel,
        },
        sentVia: ['in_app'],
        isRead: false,
      }));

      // Bulk create notifications
      await this.notificationRepository.createMany(notifications);

      this.logger.log(
        `Successfully created ${notifications.length} notifications for course: ${payload.courseId}`,
      );
    } catch (error: any) {
      this.logger.error('Error handling course published event:', error);
      // Don't throw - event-driven should be fire-and-forget
    }
  }

  /**
   * Handle unified send_notification event
   * Pattern: send_notification
   * Supports: COMMENT_REPLY, DAILY_SUMMARY
   */
  async handleSendNotification(payload: {
    recipientId: string;
    type: 'COMMENT_REPLY' | 'DAILY_SUMMARY';
    payload: {
      title: string;
      body: string;
      metadata: Record<string, any>;
    };
  }): Promise<void> {
    try {
      this.logger.log(`Handling send_notification event: type=${payload.type}, recipientId=${payload.recipientId}`);

      // Map notification type to database type
      const notificationType = payload.type === 'COMMENT_REPLY' ? 'comment' : 'post_analytics';

      // Create notification
      await this.notificationRepository.create({
        userId: payload.recipientId,
        title: payload.payload.title,
        message: payload.payload.body,
        notificationType,
        metadata: payload.payload.metadata,
        sentVia: ['in_app'],
        isRead: false,
      });

      this.logger.log(
        `Successfully created notification: type=${payload.type}, recipientId=${payload.recipientId}`,
      );
    } catch (error: any) {
      this.logger.error('Error handling send_notification event:', error);
      // Don't throw - event-driven should be fire-and-forget
    }
  }

  /**
   * Handle comment reply event - create notification for the person being replied to
   * @deprecated Use handleSendNotification instead
   * 
   * Business Rules: Send notification if recipient ≠ reply author and recipient ≠ post author
   * Skip if: replying to self or replying to staff
   */
  async handleCommentReply(payload: {
    commentId: string;
    postId: string;
    parentCommentId: string;
    repliedToUserId: string;
    replyAuthorId: string;
    content: string;
  }): Promise<void> {
    try {
      this.logger.log(`Handling comment reply event for comment: ${payload.commentId}`);

      // Double-check business rules (defense in depth)
      const isReplyingSelf = payload.repliedToUserId === payload.replyAuthorId;
      if (isReplyingSelf) {
        this.logger.log(`Skipping notification: User ${payload.replyAuthorId} is replying to their own comment`);
        return;
      }

      // Get post info to check if replied user is staff
      const post = await this.prisma.post.findUnique({
        where: { id: payload.postId },
        select: {
          title: true,
          authorId: true,
        },
      });

      if (!post) {
        this.logger.warn(`Post ${payload.postId} not found, skipping notification`);
        return;
      }

      // Check if replied user is the blog owner (staff)
      const isReplyingStaff = payload.repliedToUserId === post.authorId;
      if (isReplyingStaff) {
        this.logger.log(`Skipping notification: User ${payload.repliedToUserId} is the blog owner (staff) - will receive summary notification instead`);
        return;
      }

      // Get reply author info for notification message
      const replyAuthor = await this.prisma.user.findUnique({
        where: { id: payload.replyAuthorId },
        select: {
          displayName: true,
          email: true,
        },
      });

      const authorName = replyAuthor?.displayName || replyAuthor?.email || 'Someone';
      const postTitle = post.title || 'post';

      // Create notification for the person being replied to (user, not staff)
      await this.notificationRepository.create({
        userId: payload.repliedToUserId,
        title: 'New reply to your comment',
        message: `${authorName} replied to your comment on "${postTitle}"`,
        notificationType: 'comment',
        metadata: {
          commentId: payload.commentId,
          postId: payload.postId,
          parentCommentId: payload.parentCommentId,
          replyAuthorId: payload.replyAuthorId,
        },
        sentVia: ['in_app'],
        isRead: false,
      });

      this.logger.log(
        `Successfully created realtime notification for comment reply: ${payload.commentId} (user: ${payload.repliedToUserId})`,
      );
    } catch (error: any) {
      this.logger.error('Error handling comment reply event:', error);
      // Don't throw - event-driven should be fire-and-forget
    }
  }

  /**
   * Handle post interaction stats event - create notification for staff about daily post interactions
   */
  async handlePostInteractionStats(payload: {
    postId: string;
    postTitle: string;
    authorId: string;
    commentCount: number;
    likeCount: number;
    viewCount: number;
    date: string;
  }): Promise<void> {
    try {
      this.logger.log(`Handling post interaction stats event for post: ${payload.postId}`);

      const totalInteractions = payload.commentCount + payload.likeCount;

      if (totalInteractions === 0) {
        this.logger.log(`No interactions for post ${payload.postId}, skipping notification`);
        return;
      }

      // Create notification for post author (staff)
      await this.notificationRepository.create({
        userId: payload.authorId,
        title: 'Thống kê tương tác bài viết',
        message: `Bài viết "${payload.postTitle}" của bạn đã nhận được ${payload.commentCount} bình luận và ${payload.likeCount} lượt thích sau 1 ngày`,
        notificationType: 'post_analytics',
        metadata: {
          postId: payload.postId,
          postTitle: payload.postTitle,
          commentCount: payload.commentCount,
          likeCount: payload.likeCount,
          viewCount: payload.viewCount,
          date: payload.date,
          totalInteractions,
        },
        sentVia: ['in_app'],
        isRead: false,
      });

      this.logger.log(
        `Successfully created notification for post interaction stats: ${payload.postId}`,
      );
    } catch (error: any) {
      this.logger.error('Error handling post interaction stats event:', error);
      // Don't throw - event-driven should be fire-and-forget
    }
  }
}
