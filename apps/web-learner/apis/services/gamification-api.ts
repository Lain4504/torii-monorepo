import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type { StandardApiResponse, UserAchievementDto, StreakStatusDto } from '@workspace/schemas';

export const gamificationApi = {
    /**
     * Get user achievements
     */
    async getAchievements(): Promise<UserAchievementDto[]> {
        const response = await apiClient.get<StandardApiResponse<{ achievements: UserAchievementDto[] }>>('/api/gamification/achievements');
        if (response.data.success && response.data.data) {
            return response.data.data.achievements;
        }
        throw new Error(response.data.message || 'Failed to fetch achievements');
    },

    /**
     * Get user streak status
     */
    async getStreak(): Promise<StreakStatusDto> {
        const response = await apiClient.get<StandardApiResponse<StreakStatusDto>>('/api/gamification/streak');
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to fetch streak');
    },
};

/**
 * Hook: Get user achievements
 */
export function useAchievements() {
    return useQuery({
        queryKey: ['achievements'],
        queryFn: gamificationApi.getAchievements,
    });
}

/**
 * Hook: Get user streak
 */
export function useStreak() {
    return useQuery({
        queryKey: ['streak'],
        queryFn: gamificationApi.getStreak,
    });
}
