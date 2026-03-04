export interface IActivitiesRepository {
    /**
     * Find daily activity.
     */
    findDailyActivity(userId: string, date: string, activityType: string): Promise<any>;
    /**
     * Create daily activity.
     */
    createDailyActivity(data: any): Promise<any>;
    /**
     * Find history.
     */
    findHistory(userId: string, skip: number, take: number, type?: string): Promise<[any[], number]>;
}

export const ACTIVITIES_REPOSITORY_TOKEN = Symbol('ACTIVITIES_REPOSITORY_TOKEN');
