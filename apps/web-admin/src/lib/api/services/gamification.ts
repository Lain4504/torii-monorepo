import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client.ts';
import type {
    StandardApiResponse,
    PointRewardDTO,
    CreatePointRewardDTO,
    UpdatePointRewardDTO
} from '@workspace/schemas';

export const gamificationApi = {
    // GET /api/gamification/admin/rewards
    async findAllRewards(): Promise<PointRewardDTO[]> {
        const response = await apiClient.get<StandardApiResponse<PointRewardDTO[]>>('/api/gamification/admin/rewards');
        return response.data.data || [];
    },

    // POST /api/gamification/admin/rewards
    async createReward(data: CreatePointRewardDTO): Promise<PointRewardDTO> {
        const response = await apiClient.post<StandardApiResponse<PointRewardDTO>>('/api/gamification/admin/rewards', data);
        return response.data.data!;
    },

    // PUT /api/gamification/admin/rewards/:id
    async updateReward(id: string, data: UpdatePointRewardDTO): Promise<PointRewardDTO> {
        const response = await apiClient.put<StandardApiResponse<PointRewardDTO>>(`/api/gamification/admin/rewards/${id}`, data);
        return response.data.data!;
    },

    // DELETE /api/gamification/admin/rewards/:id
    async deleteReward(id: string): Promise<boolean> {
        const response = await apiClient.delete<StandardApiResponse<any>>(`/api/gamification/admin/rewards/${id}`);
        return response.data.success;
    }
};

// ============================================================================
// React Query Hooks
// ============================================================================

export function useAdminRewards() {
    return useQuery({
        queryKey: ['admin-rewards'],
        queryFn: () => gamificationApi.findAllRewards(),
    });
}

export function useCreateReward() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePointRewardDTO) => gamificationApi.createReward(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
        },
    });
}

export function useUpdateReward() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePointRewardDTO }) =>
            gamificationApi.updateReward(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
        },
    });
}

export function useDeleteReward() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => gamificationApi.deleteReward(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-rewards'] });
        },
    });
}
