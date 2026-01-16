import { Controller, Inject, Logger } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { INotificationService } from '../../interfaces/services';
import { NOTIFICATION_SERVICE_TOKEN } from '../../interfaces/services';
import type { NotificationEventData } from '../../interfaces/events';

/**
 * Notification NATS Message Handler
 * Handles event-driven notification creation via NATS
 */
@Controller()
export class NotificationHandler {
    private readonly logger = new Logger(NotificationHandler.name);

    constructor(
        @Inject(NOTIFICATION_SERVICE_TOKEN)
        private readonly notificationService: INotificationService,
    ) { }

    /**
     * Handle unified send_notification event
     * Pattern: send_notification
     * Supports: COMMENT_REPLY, DAILY_SUMMARY
     */
    @MessagePattern({ cmd: 'send_notification' })
    async handleSendNotification(@Payload() payload: NotificationEventData): Promise<void> {
        try {
            this.logger.log(`Received send_notification event: type=${payload.type}, recipientId=${payload.recipientId}`);
            await this.notificationService.handleSendNotification(payload);
        } catch (error: any) {
            this.logger.error(`Error handling send_notification event: ${error?.message}`, error);
            // Don't throw - event-driven should be fire-and-forget
        }
    }

    /**
     * Handle course published event
     * Pattern: course.published
     * Legacy event, kept for backward compatibility
     */
    @MessagePattern({ cmd: 'course.published' })
    async handleCoursePublished(@Payload() payload: {
        courseId: string;
        courseTitle: string;
        courseJlptLevel: string;
        userIds?: string[];
    }): Promise<void> {
        try {
            this.logger.log(`Received course.published event for course: ${payload.courseId}`);
            await this.notificationService.handleCoursePublished(payload);
        } catch (error: any) {
            this.logger.error(`Error handling course.published event: ${error?.message}`, error);
            // Don't throw - event-driven should be fire-and-forget
        }
    }

    @MessagePattern({ cmd: 'communication.notification.findAll' })
    async findAll(@Payload() payload: { userId: string; query: any }) {
        return this.notificationService.findAll(payload.userId, payload.query);
    }

    @MessagePattern({ cmd: 'communication.notification.getUnreadCount' })
    async getUnreadCount(@Payload() payload: { userId: string }) {
        return this.notificationService.getUnreadCount(payload.userId);
    }

    @MessagePattern({ cmd: 'communication.notification.markAsRead' })
    async markAsRead(@Payload() payload: { notificationId: string; userId: string }) {
        return this.notificationService.markAsRead(payload.notificationId, payload.userId);
    }

    @MessagePattern({ cmd: 'communication.notification.markAllAsRead' })
    async markAllAsRead(@Payload() payload: { userId: string }) {
        return this.notificationService.markAllAsRead(payload.userId);
    }

    @MessagePattern({ cmd: 'communication.notification.delete' })
    async delete(@Payload() payload: { notificationId: string; userId: string }) {
        return this.notificationService.delete(payload.notificationId, payload.userId);
    }

    @MessagePattern({ cmd: 'communication.notification.create' })
    async create(@Payload() payload: any) {
        return this.notificationService.create(payload);
    }
}
