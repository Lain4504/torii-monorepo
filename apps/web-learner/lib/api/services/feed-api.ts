import { apiClient } from '../api-client';
import type {
    FeedCreateDTO,
    FeedUpdateDTO,
    FeedQueryDTO,
    FeedResponseDTO,
    FeedPaginatedResponse,
    StandardApiResponse,
    PaginatedApiResponse,
} from '@workspace/schemas';

export const feedApi = {
    findAll: async (params: FeedQueryDTO): Promise<FeedPaginatedResponse> => {
        const response = await apiClient.get<PaginatedApiResponse<FeedResponseDTO>>('/api/feed', {
            params,
        });
        // Handle potential nested data structure from backend wrapper
        const data = response.data;
        return {
            data: data.data || [],
            total: data.total || 0,
            page: data.page || 1,
            limit: data.limit || 20,
            totalPages: data.totalPages || 0,
        };
    },

    findById: async (id: string): Promise<FeedResponseDTO> => {
        const response = await apiClient.get<StandardApiResponse<FeedResponseDTO>>(`/api/feed/${id}`);
        return response.data.data!;
    },

    create: async (dto: FeedCreateDTO): Promise<FeedResponseDTO> => {
        const response = await apiClient.post<StandardApiResponse<FeedResponseDTO>>('/api/feed', dto);
        return response.data.data!;
    },

    update: async (id: string, dto: FeedUpdateDTO): Promise<FeedResponseDTO> => {
        const response = await apiClient.patch<StandardApiResponse<FeedResponseDTO>>(`/api/feed/${id}`, dto);
        return response.data.data!;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/feed/${id}`);
    },

    toggleLike: async (id: string): Promise<{ isLiked: boolean; likeCount: number }> => {
        const response = await apiClient.post<StandardApiResponse<{ isLiked: boolean; likeCount: number }>>(`/api/feed/${id}/like`);
        return response.data.data!;
    },

    findByUser: async (userId: string, params: FeedQueryDTO): Promise<FeedPaginatedResponse> => {
        // Can reuse findAll with authorId filter
        return feedApi.findAll({ ...params, authorId: userId });
    }
};
