import { Injectable, Logger } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '@server/shared';
import { Notification } from '@prisma/generated';
import {
  NotificationResponseDTO,
  NotificationQueryDTO,
  NotificationCreateDTO,
  NotificationPaginatedResponse,
  NotificationUnreadCountResponseDTO,
  PaginatedResponseDTO,
} from '@workspace/schemas';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(private readonly prisma: PrismaService) { }

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
      const skip = (page - 1) * limit;

      const whereClause: Record<string, any> = {
        userId,
      };

      // Filter by read status if provided
      if (isRead !== undefined) {
        whereClause.isRead = isRead;
      }

      const [total, notifications] = await Promise.all([
        this.prisma.notification.count({ where: whereClause }),
        this.prisma.notification.findMany({
          take: limit,
          skip: skip,
          where: whereClause,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: notifications.map((n) => this.toNotificationResponseDto(n)),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error: any) {
      this.logger.error('Failed to retrieve notifications', error);
      throw new RpcException({
        status: 500,
        message: `Failed to retrieve notifications: ${error?.message || 'Unknown error'}`,
      });
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<NotificationResponseDTO> {
    try {
      // Verify notification exists and belongs to user
      const existing = await this.prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      });

      if (!existing) {
        throw new RpcException({
          status: 404,
          message: `Notification with id ${notificationId} not found`,
        });
      }

      // Update notification
      const notification = await this.prisma.notification.update({
        where: { id: notificationId },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return this.toNotificationResponseDto(notification);
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }
      this.logger.error('Error marking notification as read', error);
      throw new RpcException({
        status: 500,
        message: `Failed to mark notification as read: ${error?.message || 'Unknown error'}`,
      });
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<{ success: boolean; message: string; count: number }> {
    try {
      const result = await this.prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return {
        success: true,
        message: `${result.count} notification(s) marked as read`,
        count: result.count,
      };
    } catch (error: any) {
      this.logger.error('Error marking all notifications as read', error);
      throw new RpcException({
        status: 500,
        message: `Failed to mark all notifications as read: ${error?.message || 'Unknown error'}`,
      });
    }
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId: string): Promise<NotificationUnreadCountResponseDTO> {
    try {
      const count = await this.prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });

      return {
        count,
      };
    } catch (error: any) {
      this.logger.error('Error getting unread count', error);
      throw new RpcException({
        status: 500,
        message: `Failed to get unread count: ${error?.message || 'Unknown error'}`,
      });
    }
  }

  /**
   * Delete a notification
   */
  async delete(notificationId: string, userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // Verify notification exists and belongs to user
      const existing = await this.prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      });

      if (!existing) {
        throw new RpcException({
          status: 404,
          message: `Notification with id ${notificationId} not found`,
        });
      }

      // Hard delete the notification
      await this.prisma.notification.delete({
        where: { id: notificationId },
      });

      return {
        success: true,
        message: 'Notification deleted successfully',
      };
    } catch (error: any) {
      if (error instanceof RpcException) {
        throw error;
      }
      this.logger.error('Error deleting notification', error);
      throw new RpcException({
        status: 500,
        message: `Failed to delete notification: ${error?.message || 'Unknown error'}`,
      });
    }
  }

  /**
   * Create a notification (for event-driven use cases)
   */
  async create(data: NotificationCreateDTO): Promise<NotificationResponseDTO> {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          userId: data.userId,
          title: data.title,
          message: data.message,
          notificationType: data.notificationType,
          metadata: data.metadata || null,
          sentVia: data.sentVia || ['in_app'],
          isRead: false,
        },
      });

      return this.toNotificationResponseDto(notification);
    } catch (error: any) {
      this.logger.error('Error creating notification', error);
      throw new RpcException({
        status: 400,
        message: `Failed to create notification: ${error?.message || 'Unknown error'}`,
      });
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
        // Fallback: Use MOCK_USER_ID for testing when no userIds provided
        // In production, this should query from wishlist or other sources
        const MOCK_USER_ID = '5e808603-1e54-4dc9-ae93-f1e347c101ab';
        userIdsToNotify = [MOCK_USER_ID];
        this.logger.log(`No userIds provided, using fallback MOCK_USER_ID: ${MOCK_USER_ID}`);

        // Note: Wishlist query is skipped for now
        // To enable wishlist query in the future, uncomment below:
        // const wishlistUsers = await this.prisma.$queryRaw<Array<{ user_id: string }>>`
        //   SELECT DISTINCT user_id 
        //   FROM wishlist 
        //   WHERE course_id = ${payload.courseId}::uuid
        // `;
        // userIdsToNotify = wishlistUsers.map((w) => w.user_id);
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
        data: {
          courseId: payload.courseId,
          courseTitle: payload.courseTitle,
          courseJlptLevel: payload.courseJlptLevel,
        },
        sentVia: ['in_app'],
        isRead: false,
      }));

      // Bulk create notifications
      await this.prisma.notification.createMany({
        data: notifications,
      });

      this.logger.log(
        `Successfully created ${notifications.length} notifications for course: ${payload.courseId}`,
      );
    } catch (error: any) {
      this.logger.error('Error handling course published event:', error);
      // Don't throw - event-driven should be fire-and-forget
    }
  }
}



