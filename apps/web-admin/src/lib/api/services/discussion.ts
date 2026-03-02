import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type {
    DiscussionTopicQueryDTO,
    DiscussionTopicResponseDTO,
    DiscussionTopicPaginatedResponse,
    DiscussionTopicUpdateDTO,
    StandardApiResponse,
} from '@workspace/schemas';

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

    update: async (id: string, dto: DiscussionTopicUpdateDTO): Promise<DiscussionTopicResponseDTO> => {
        // We'll need a patch endpoint in Gateway/Learning service for this
        const response = await apiClient.patch<StandardApiResponse<DiscussionTopicResponseDTO>>(`/api/discussions/${id}`, dto);
        if (!response.data.success || !response.data.data) {
            throw new Error('Failed to update discussion');
        }
        return response.data.data;
    },

    delete: async (id: string): Promise<boolean> => {
        const response = await apiClient.delete<StandardApiResponse<boolean>>(`/api/discussions/${id}`);
        return !!response.data.success;
    },
};

export function useDiscussions(params: DiscussionTopicQueryDTO) {
    return useQuery({
        queryKey: ['discussions', params],
        queryFn: () => discussionApi.findAll(params),
    });
}

export function useDiscussion(id: string) {
    return useQuery({
        queryKey: ['discussions', id],
        queryFn: () => discussionApi.findById(id),
        enabled: !!id,
    });
}

export function useUpdateDiscussion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: DiscussionTopicUpdateDTO }) =>
            discussionApi.update(id, dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['discussions'] });
        },
    });
}
