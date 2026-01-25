import { Controller, Logger, Inject } from '@nestjs/common';
import { EventPattern, Payload, ClientProxy } from '@nestjs/microservices';
import { NotificationType } from '@workspace/schemas';
import type { SendNotificationEvent } from '../../infrastructure/events/notification.event';
import type { OrderPaymentSuccessEvent, OrderStatusChangedEvent } from '../../infrastructure/events/order.event';
import type { CourseEnrollmentSuccessEvent } from '../../infrastructure/events/enrollment.event';

import { NOTIFICATION_SERVICE_TOKEN } from '../../interfaces/services';
import type { INotificationService } from '../../interfaces/services';

/**
 * Notification Controller
 * Handles NATS events for notifications
 */
@Controller()
export class NotificationHandler {
    private readonly logger = new Logger(NotificationHandler.name);

    constructor(
        @Inject(NOTIFICATION_SERVICE_TOKEN) private readonly notificationService: INotificationService,
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    /**
     * Handle generic send_notification event
     */
    @EventPattern({ cmd: 'send_notification' })
    async handleSendNotification(@Payload() event: SendNotificationEvent): Promise<void> {
        this.logger.log(`Received send_notification event for user ${event.recipientId}, type: ${event.type}`);

        try {
            await this.notificationService.create({
                userId: event.recipientId,
                title: event.payload.title,
                message: event.payload.body,
                notificationType: event.type as any,
                metadata: event.payload.metadata || {},
            });

            this.logger.log(`Notification created for user ${event.recipientId}`);

            // Optionally send email if requested
            if (event.sendEmail) {
                this.natsClient.emit({ cmd: 'send_email' }, {
                    type: 'notification',
                    to: event.recipientId, // Should be email, handled by email service
                    data: {
                        title: event.payload.title,
                        body: event.payload.body,
                    },
                });
            }
        } catch (error: any) {
            this.logger.error(`Failed to create notification: ${error.message}`, error.stack);
        }
    }

    /**
     * Handle order_payment_success event
     * Creates notification and sends email with course link
     */
    @EventPattern({ cmd: 'order_payment_success' })
    async handleOrderPaymentSuccess(@Payload() event: OrderPaymentSuccessEvent): Promise<void> {
        this.logger.log(`Received order_payment_success event for order ${event.orderId}, user: ${event.userId}`);

        try {
            // Create in-app notification
            await this.notificationService.create({
                userId: event.userId,
                title: 'Thanh toán thành công! 🎉',
                message: `Bạn đã thanh toán thành công khóa học "${event.courseName}". Bắt đầu học ngay!`,
                notificationType: NotificationType.ORDER_SUCCESS,
                metadata: {
                    orderId: event.orderId,
                    courseId: event.courseId,
                    courseName: event.courseName,
                    amount: event.amount,
                },
            });

            this.logger.log(`Order success notification created for user ${event.userId}`);

            // Send email with course link
            this.natsClient.emit({ cmd: 'send_email' }, {
                type: 'order_success',
                to: event.userEmail,
                data: {
                    displayName: event.userName,
                    courseName: event.courseName,
                    courseUrl: `${process.env.WEB_URL || 'https://app.torii.sbs'}/courses/${event.courseId}`,
                    amount: event.amount,
                    currency: event.currency,
                    orderId: event.orderId,
                },
            });

            this.logger.log(`Order success email event emitted for ${event.userEmail}`);
        } catch (error: any) {
            this.logger.error(`Failed to handle order payment success: ${error.message}`, error.stack);
        }
    }

    /**
     * Handle order_status_changed event
     */
    @EventPattern({ cmd: 'order_status_changed' })
    async handleOrderStatusChanged(@Payload() event: OrderStatusChangedEvent): Promise<void> {
        this.logger.log(`Received order_status_changed event for order ${event.orderId}, status: ${event.oldStatus} → ${event.newStatus}`);

        try {
            await this.notificationService.create({
                userId: event.userId,
                title: 'Trạng thái đơn hàng thay đổi',
                message: `Đơn hàng ${event.orderId} đã chuyển từ ${event.oldStatus} sang ${event.newStatus}`,
                notificationType: NotificationType.ORDER_STATUS_UPDATE,
                metadata: {
                    orderId: event.orderId,
                    oldStatus: event.oldStatus,
                    newStatus: event.newStatus,
                },
            });

            this.logger.log(`Order status change notification created for user ${event.userId}`);
        } catch (error: any) {
            this.logger.error(`Failed to handle order status changed: ${error.message}`, error.stack);
        }
    }

    /**
     * Handle course_enrollment_success event
     * Creates notification and sends email for free courses
     */
    @EventPattern({ cmd: 'course_enrollment_success' })
    async handleCourseEnrollmentSuccess(@Payload() event: CourseEnrollmentSuccessEvent): Promise<void> {
        this.logger.log(`Received course_enrollment_success event for enrollment ${event.enrollmentId}, user: ${event.userId}`);

        try {
            // Create in-app notification
            await this.notificationService.create({
                userId: event.userId,
                title: 'Tham gia khóa học thành công! 🎉',
                message: `Bạn đã tham gia thành công khóa học "${event.courseName}". Bắt đầu học ngay!`,
                notificationType: NotificationType.COURSE, // Use COURSE type for enrollment
                metadata: {
                    enrollmentId: event.enrollmentId,
                    courseId: event.courseId,
                    courseName: event.courseName,
                },
            });

            this.logger.log(`Enrollment success notification created for user ${event.userId}`);

            // Send email
            if (event.userEmail) {
                this.logger.log(`Emitting send_email for ${event.userEmail} (course: ${event.courseName})`);
                this.natsClient.emit({ cmd: 'send_email' }, {
                    type: 'course_enrollment',
                    to: event.userEmail,
                    data: {
                        displayName: event.userName,
                        courseName: event.courseName,
                        courseUrl: `${process.env.WEB_URL || 'https://app.torii.sbs'}/courses/${event.courseId}`,
                    },
                });

                this.logger.log(`Enrollment success email event emitted for ${event.userEmail}`);
            } else {
                this.logger.warn(`Missing userEmail in CourseEnrollmentSuccessEvent for user ${event.userId}`);
            }
        } catch (error: any) {
            this.logger.error(`Failed to handle course enrollment success: ${error.message}`, error.stack);
        }
    }
}