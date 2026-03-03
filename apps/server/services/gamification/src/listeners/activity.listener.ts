import { Controller, Logger, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { UserActivityEvent } from '@workspace/schemas';
import { ACTIVITIES_SERVICE_TOKEN } from '@server/gamification/interfaces/services';
import type { IActivitiesService } from '@server/gamification/interfaces/services';

@Controller()
export class ActivityListener {
    private readonly logger = new Logger(ActivityListener.name);

    constructor(
        @Inject(ACTIVITIES_SERVICE_TOKEN) private readonly activityService: IActivitiesService
    ) { }

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
