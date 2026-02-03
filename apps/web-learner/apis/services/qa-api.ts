import { apiClient } from '../api-client';
import type {
    QACreateDTO,
    QAUpdateDTO,
    QAQueryDTO,
    QAResponseDTO,
    QAPaginatedResponse,
    StandardApiResponse,
    PaginatedApiResponse,
} from '@workspace/schemas';

export const qaApi = {
    findAll: async (params: QAQueryDTO): Promise<QAPaginatedResponse> => {
        const response = await apiClient.get<PaginatedApiResponse<QAResponseDTO>>('/api/qa', {
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

    findById: async (id: string): Promise<QAResponseDTO> => {
        const response = await apiClient.get<StandardApiResponse<QAResponseDTO>>(`/api/qa/${id}`);
        return response.data.data!;
    },

    create: async (dto: QACreateDTO): Promise<QAResponseDTO> => {
        const response = await apiClient.post<StandardApiResponse<QAResponseDTO>>('/api/qa', dto);
        return response.data.data!;
    },

    update: async (id: string, dto: QAUpdateDTO): Promise<QAResponseDTO> => {
        const response = await apiClient.patch<StandardApiResponse<QAResponseDTO>>(`/api/qa/${id}`, dto);
        return response.data.data!;
    },

    delete: async (id: string): Promise<void> => {
        await apiClient.delete(`/api/qa/${id}`);
    },

    toggleLike: async (id: string): Promise<{ isLiked: boolean; likeCount: number }> => {
        const response = await apiClient.post<StandardApiResponse<{ isLiked: boolean; likeCount: number }>>(`/api/qa/${id}/like`);
        return response.data.data!;
    },



    findByUser: async (userId: string, params: QAQueryDTO): Promise<QAPaginatedResponse> => {
        // Can reuse findAll with authorId filter
        return qaApi.findAll({ ...params, authorId: userId });
    }
};
