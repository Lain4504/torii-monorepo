import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type { StandardApiResponse, UserResponseDTO } from '@workspace/schemas';

export const lecturerApi = {
    /**
     * Get public profile by ID
     */
    async getProfile(id: string): Promise<UserResponseDTO> {
        const response = await apiClient.get<StandardApiResponse<{ user: UserResponseDTO }>>(`/api/profiles/${id}`);
        if (response.data.success && response.data.data) {
            return response.data.data.user;
        }
        throw new Error(response.data.message || 'Failed to fetch lecturer profile');
    },
};

/**
 * Hook: Get lecturer profile
 */
export function useLecturer(id: string) {
    return useQuery({
        queryKey: ['lecturers', id],
        queryFn: () => lecturerApi.getProfile(id),
        enabled: !!id,
    });
}
