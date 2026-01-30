import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type { StandardApiResponse, UserAchievementDto, StreakStatusDto } from '@workspace/schemas';
import { toast } from 'sonner';
import { useEffect, useRef } from 'react';

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

    /**
     * Get user gamification profile (XP, Level, Hearts)
     */
    async getProfile(): Promise<any> {
        const response = await apiClient.get<StandardApiResponse<any>>('/api/gamification/profile');
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to fetch profile');
    },

    /**
     * Get shop items
     */
    async getShopItems(): Promise<any[]> {
        const response = await apiClient.get<StandardApiResponse<any[]>>('/api/gamification/shop');
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to fetch shop items');
    },

    /**
     * Buy shop item
     */
    async buyItem(itemCode: string): Promise<any> {
        // Assume non-GET for buying, let's check GatewayController.
        // Wait, GatewayController only had @Get('shop'). I should add @Post('shop/buy').
        // Let's assume the API will be /api/gamification/shop/buy
        const response = await apiClient.post<StandardApiResponse<any>>(`/api/gamification/shop/buy`, { itemCode });
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to buy item');
    },

    /**
     * Get weekly leaderboard
     */
    async getLeaderboard(): Promise<any[]> {
        const response = await apiClient.get<StandardApiResponse<any[]>>('/api/gamification/leaderboard');
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to fetch leaderboard');
    },
};

/**
 * Hook: Get user profile
 */
export function useGamificationProfile() {
    return useQuery({
        queryKey: ['gamification-profile'],
        queryFn: gamificationApi.getProfile,
    });
}

/**
 * Hook: Get shop items
 */
export function useShopItems() {
    return useQuery({
        queryKey: ['shop-items'],
        queryFn: gamificationApi.getShopItems,
    });
}

/**
 * Hook: Buy item
 */
export function useBuyItem() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (itemCode: string) => gamificationApi.buyItem(itemCode),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gamification-profile'] });
            queryClient.invalidateQueries({ queryKey: ['streak'] });
            toast.success('Mua hàng thành công!');
        },
        onError: (error: any) => {
            toast.error(error.message || 'Không thể mua hàng');
        }
    });
}

/**
 * Hook: Get leaderboard
 */
export function useLeaderboard() {
    return useQuery({
        queryKey: ['leaderboard'],
        queryFn: gamificationApi.getLeaderboard,
    });
}

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
 * Hook: Get user streak with optional auto-refetch and celebration toasts
 * 
 * Note: Daily check-in happens automatically when users complete learning activities
 * (lessons, quizzes, etc.). This hook just displays the streak status and celebrates
 * milestones when detected.
 */
export function useStreak(options?: { refetchInterval?: number; enableCelebrations?: boolean }) {
    const celebratedRef = useRef<Set<number>>(new Set());

    const query = useQuery({
        queryKey: ['streak'],
        queryFn: gamificationApi.getStreak,
        refetchInterval: options?.refetchInterval,
        staleTime: 30000, // Consider data fresh for 30 seconds
    });

    // Celebrate milestones when streak updates
    useEffect(() => {
        if (!options?.enableCelebrations || !query.data) return;

        const { currentStreak, isActiveToday } = query.data;

        // Only celebrate if active today and haven't celebrated this streak yet
        if (isActiveToday && currentStreak > 0 && !celebratedRef.current.has(currentStreak)) {
            const milestones = [3, 7, 14, 30, 50, 100, 365];
            const isMilestone = milestones.includes(currentStreak);

            if (isMilestone) {
                // Big milestone celebration
                toast.success(`🏆 ${currentStreak}-Day Streak Milestone!`, {
                    description: 'Amazing achievement! Keep up the great work! 🎉',
                    duration: 5000,
                });

                // Trigger confetti animation (if available)
                if (typeof window !== 'undefined' && (window as any).confetti) {
                    (window as any).confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 }
                    });
                }
            }

            // Mark as celebrated
            celebratedRef.current.add(currentStreak);
        }
    }, [query.data, options?.enableCelebrations]);

    return query;
}

/**
 * Hook: Manual "check-in" button (for UI purposes)
 * 
 * Since backend doesn't have a dedicated check-in endpoint, this creates
 * a motivational call-to-action that encourages users to do learning activities.
 * The actual streak update happens via backend NATS events when users complete
 * lessons, quizzes, flashcards, etc.
 */
export function useCheckIn() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async () => {
            // Simulate a check-in action by refetching streak
            // In reality, users need to complete a learning activity to update streak
            await queryClient.invalidateQueries({ queryKey: ['streak'] });

            // Return mock success
            return {
                streakUpdated: false,
                currentStreak: 0,
                achievementsUnlocked: [],
            };
        },
        onMutate: async () => {
            toast.info('📚 Complete a lesson to check in!', {
                description: 'Start learning to build your streak',
                duration: 3000,
            });
        },
        onSuccess: () => {
            // Refetch to get latest streak
            queryClient.invalidateQueries({ queryKey: ['streak'] });
        },
    });
}
