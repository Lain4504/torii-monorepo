import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ACTIVITIES_SERVICE_TOKEN } from '@server/gamification/interfaces/services';
import type { IActivitiesService } from '@server/gamification/interfaces/services';
import type { ActivityType } from '@workspace/schemas';

@Controller()
export class ActivitiesHandler {
    constructor(
        @Inject(ACTIVITIES_SERVICE_TOKEN) private readonly activitiesService: IActivitiesService
    ) { }

    // Legacy alias
    @MessagePattern({ cmd: 'gamification.recordActivity' })
    async recordActivityLegacy(
        @Payload() data: { userId: string; activityType: ActivityType; meta?: any },
    ) {
        return this.activitiesService.recordActivity(data.userId, data.activityType, data.meta);
    }

    @MessagePattern({ cmd: 'gamification.activity.record' })
    async recordActivity(
        @Payload() data: { userId: string; activityType: ActivityType; meta?: any },
    ) {
        return this.activitiesService.recordActivity(data.userId, data.activityType, data.meta);
    }

    // Legacy alias
    @MessagePattern({ cmd: 'gamification.getHistory' })
    async getHistoryLegacy(@Payload() data: { userId: string; page?: number; limit?: number; type?: string }) {
        return this.activitiesService.getHistory(data.userId, {
            page: data.page,
            limit: data.limit,
            type: data.type,
        });
    }

    @MessagePattern({ cmd: 'gamification.activity.history' })
    async getHistory(@Payload() data: { userId: string; page?: number; limit?: number; type?: string }) {
        return this.activitiesService.getHistory(data.userId, {
            page: data.page,
            limit: data.limit,
            type: data.type,
        });
    }
}
