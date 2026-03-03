export interface IActivitiesRepository {
    findDailyActivity(userId: string, date: string, activityType: string): Promise<any>;
    createDailyActivity(data: any): Promise<any>;
    findHistory(userId: string, skip: number, take: number, type?: string): Promise<[any[], number]>;
}

export const ACTIVITIES_REPOSITORY_TOKEN = Symbol('ACTIVITIES_REPOSITORY_TOKEN');
