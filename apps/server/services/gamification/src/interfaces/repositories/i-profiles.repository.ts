import type { UserGamification, Prisma } from '@prisma/generated';

export interface IProfilesRepository {
    findByUserId(userId: string): Promise<UserGamification | null>;
    upsert(userId: string, data: Prisma.UserGamificationUpdateInput, create: Omit<Prisma.UserGamificationCreateInput, 'user'>): Promise<UserGamification>;
    update(userId: string, data: Prisma.UserGamificationUpdateInput): Promise<UserGamification>;
    findUsersAtRiskOfStreakReset(twoDaysAgo: string): Promise<UserGamification[]>;
    incrementActiveCounts(userId: string, isSameWeek: boolean, isSameMonth: boolean): Promise<UserGamification>;
}

export const PROFILES_REPOSITORY_TOKEN = Symbol('PROFILES_REPOSITORY_TOKEN');
