import { Controller, Logger } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import {
  NotificationQueryDto,
  NotificationResponseDto,
  NotificationListResponseDto,
  CreateNotificationDto,
  MarkAsReadRequestDto,
  MarkAllAsReadRequestDto,
  DeleteNotificationRequestDto,
  UnreadCountResponseDto,
} from '@workspace/dtos';
import { NotificationService } from './notification.service';

@Controller()
export class NotificationController {
  private readonly logger = new Logger(NotificationController.name);

  constructor(private readonly notificationService: NotificationService) {}

  @MessagePattern({ cmd: 'notification.findAll' })
  async findAll(
    @Payload() payload: { userId: string; query: NotificationQueryDto },
  ): Promise<NotificationListResponseDto> {
    try {
      this.logger.log(`Finding notifications for user: ${payload.userId}`);
      return await this.notificationService.findAll(payload.userId, payload.query);
    } catch (error: any) {
      this.logger.error('Error in notification.findAll:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'notification.markAsRead' })
  async markAsRead(
    @Payload() payload: MarkAsReadRequestDto,
  ): Promise<NotificationResponseDto> {
    try {
      this.logger.log(`Marking notification ${payload.notificationId} as read for user: ${payload.userId}`);
      return await this.notificationService.markAsRead(
        payload.notificationId,
        payload.userId,
      );
    } catch (error: any) {
      this.logger.error('Error in notification.markAsRead:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'notification.markAllAsRead' })
  async markAllAsRead(
    @Payload() payload: MarkAllAsReadRequestDto,
  ): Promise<{ success: boolean; message: string; count: number }> {
    try {
      this.logger.log(`Marking all notifications as read for user: ${payload.userId}`);
      return await this.notificationService.markAllAsRead(payload.userId);
    } catch (error: any) {
      this.logger.error('Error in notification.markAllAsRead:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'notification.getUnreadCount' })
  async getUnreadCount(
    @Payload() payload: { userId: string },
  ): Promise<UnreadCountResponseDto> {
    try {
      this.logger.log(`Getting unread count for user: ${payload.userId}`);
      return await this.notificationService.getUnreadCount(payload.userId);
    } catch (error: any) {
      this.logger.error('Error in notification.getUnreadCount:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'notification.delete' })
  async delete(
    @Payload() payload: DeleteNotificationRequestDto,
  ): Promise<{ success: boolean; message: string }> {
    try {
      this.logger.log(`Deleting notification ${payload.notificationId} for user: ${payload.userId}`);
      return await this.notificationService.delete(
        payload.notificationId,
        payload.userId,
      );
    } catch (error: any) {
      this.logger.error('Error in notification.delete:', error);
      throw error;
    }
  }

  @MessagePattern({ cmd: 'notification.create' })
  async create(
    @Payload() payload: CreateNotificationDto,
  ): Promise<NotificationResponseDto> {
    try {
      this.logger.log(`Creating notification for user: ${payload.userId}`);
      this.logger.debug('Notification data:', JSON.stringify(payload, null, 2));
      return await this.notificationService.create(payload);
    } catch (error: any) {
      this.logger.error('Error in notification.create:', error);
      throw error;
    }
  }

  /**
   * Event-driven handler: Course Published Event
   * Automatically creates notifications for interested learners when a course is published
   */
  @EventPattern({ cmd: 'course.published' })
  async handleCoursePublished(
    @Payload() payload: {
      courseId: string;
      courseTitle: string;
      courseJlptLevel: string;
      userIds?: string[]; // Optional: specific user IDs to notify
    },
  ): Promise<void> {
    try {
      this.logger.log(`Received course.published event for course: ${payload.courseId}`);
      this.logger.debug('Course published payload:', JSON.stringify(payload, null, 2));

      // Call service to handle course published event
      await this.notificationService.handleCoursePublished(payload);
    } catch (error: any) {
      // Event-driven: log error but don't throw (fire-and-forget)
      this.logger.error('Error handling course.published event:', error);
    }
  }
}


