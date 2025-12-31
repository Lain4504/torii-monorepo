import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { NotificationService } from '../../modules/notification/notification.service';

@Controller()
export class NotificationEventController {
  private readonly logger = new Logger(NotificationEventController.name);

  constructor(private readonly notificationService: NotificationService) { }

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


