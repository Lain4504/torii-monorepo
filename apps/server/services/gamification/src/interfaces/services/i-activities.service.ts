import type { ActivityType as SchemaActivityType } from '@workspace/schemas';

export interface IActivitiesService {
    recordActivity(
        userId: string,
        activityType: SchemaActivityType,
        meta?: Record<string, any>,
    ): Promise<any>;
    getHistory(userId: string, query: { page?: any, limit?: any, type?: any }): Promise<any>;
}

export const ACTIVITIES_SERVICE_TOKEN = Symbol('ACTIVITIES_SERVICE_TOKEN');
