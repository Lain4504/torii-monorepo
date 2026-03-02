import { apiClient } from '../api-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type {
    DiscussionTopicCreateDTO,
    DiscussionTopicQueryDTO,
    DiscussionTopicResponseDTO,
    DiscussionTopicPaginatedResponse,
    StandardApiResponse,
} from '@workspace/schemas';

/**
 * API client for Discussions
 */
export const discussionApi = {
    findAll: async (params: DiscussionTopicQueryDTO): Promise<DiscussionTopicPaginatedResponse> => {
        const response = await apiClient.get<DiscussionTopicPaginatedResponse>('/api/discussions', {
            params,
        });
        return response.data;
    },

    findById: async (id: string): Promise<DiscussionTopicResponseDTO> => {
        const response = await apiClient.get<StandardApiResponse<DiscussionTopicResponseDTO>>(`/api/discussions/${id}`);
        if (!response.data.success || !response.data.data) {
            throw new Error('Failed to fetch discussion');
        }
        return response.data.data;
    },

    create: async (dto: DiscussionTopicCreateDTO): Promise<DiscussionTopicResponseDTO> => {
        const response = await apiClient.post<StandardApiResponse<DiscussionTopicResponseDTO>>('/api/discussions', dto);
        if (!response.data.success || !response.data.data) {
            throw new Error('Failed to create discussion');
        }
        return response.data.data;
    },

    delete: async (id: string): Promise<boolean> => {
        const response = await apiClient.delete<StandardApiResponse<boolean>>(`/api/discussions/${id}`);
        return !!response.data.success;
    },
};

/**
 * Hook for fetching discussions for a lesson
 */
export function useDiscussions(lessonId: string) {
    return useQuery({
        queryKey: ['discussions', 'lesson', lessonId],
        queryFn: () => discussionApi.findAll({ lessonId, page: 1, limit: 100 }),
        enabled: !!lessonId,
    });
}

/**
 * Hook for creating a discussion
 */
export function useCreateDiscussion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (dto: DiscussionTopicCreateDTO) => discussionApi.create(dto),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['discussions', 'lesson', variables.lessonId] });
        },
    });
}
