import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { UserActivityEvent } from '@workspace/schemas';
import { ActivityService } from '../../services/activity.service';

@Controller()
export class ActivityHandler {
    private readonly logger = new Logger(ActivityHandler.name);

    constructor(private readonly activityService: ActivityService) { }

    /**
     * Handle user activity events from other services
     */
    @EventPattern('user.activity')
    async handleUserActivity(@Payload() event: UserActivityEvent) {
        try {
            this.logger.log(`Received activity event: ${event.activityType} for user ${event.userId}`);

            await this.activityService.recordActivity(
                event.userId,
                event.activityType,
                event.meta,
            );

            this.logger.log(`Successfully processed activity for user ${event.userId}`);
        } catch (error) {
            this.logger.error(
                `Failed to process activity for user ${event.userId}`,
                error.stack,
            );
        }
    }
}
