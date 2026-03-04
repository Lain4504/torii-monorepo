import type { UserGamification, Prisma } from '@prisma/generated';

export interface IProfilesRepository {
    /**
     * Find by user id.
     */
    findByUserId(userId: string): Promise<UserGamification | null>;
    /**
     * Upsert data.
     */
    upsert(userId: string, data: Prisma.UserGamificationUpdateInput, create: Omit<Prisma.UserGamificationCreateInput, 'user'>): Promise<UserGamification>;
    /**
     * Update data.
     */
    update(userId: string, data: Prisma.UserGamificationUpdateInput): Promise<UserGamification>;
    /**
     * Find users at risk of streak reset.
     */
    findUsersAtRiskOfStreakReset(twoDaysAgo: string): Promise<UserGamification[]>;
    /**
     * Execute increment active counts operation.
     */
    incrementActiveCounts(userId: string, isSameWeek: boolean, isSameMonth: boolean): Promise<UserGamification>;
}

export const PROFILES_REPOSITORY_TOKEN = Symbol('PROFILES_REPOSITORY_TOKEN');
