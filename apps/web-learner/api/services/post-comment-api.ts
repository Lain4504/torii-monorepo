import { apiClient } from '../api-client';
import type { 
    BlogCommentCreateDTO, 
    BlogCommentUpdateDTO, 
    BlogCommentQueryDTO, 
    BlogCommentResponseDTO,
    BlogCommentPaginatedResponse
} from '@workspace/schemas';

/**
 * Helper to transform backend Prisma response to frontend DTO
 * Handles mapping nulls to undefined/0
 */
const transformComment = (data: any): BlogCommentResponseDTO => {
    if (!data) return data;
    return {
        ...data,
        parentId: data.parentCommentId || undefined,
        likeCount: data.likes || 0,
        replies: data.replies?.map(transformComment),
    };
};

/**
 * API client for Post Comments
 */
export const postCommentApi = {
    /**
     * Get all comments for a post
     */
    findAll: async (params: BlogCommentQueryDTO): Promise<BlogCommentPaginatedResponse> => {
        const response = await apiClient.get<BlogCommentPaginatedResponse>('/api/comments', {
            params,
        });
        return {
            ...response.data,
            data: response.data.data.map(transformComment),
        };
    },

    /**
     * Get comment with its replies
     */
    getWithReplies: async (id: string, depth: number = 2): Promise<BlogCommentResponseDTO> => {
        const response = await apiClient.get<BlogCommentResponseDTO>(`/api/comments/${id}/replies`, {
            params: { depth },
        });
        return transformComment(response.data);
    },

    /**
     * Create a new comment
     */
    create: async (dto: BlogCommentCreateDTO): Promise<BlogCommentResponseDTO> => {
        const response = await apiClient.post<BlogCommentResponseDTO>('/api/comments', dto);
        return transformComment(response.data);
    },

    /**
     * Update a comment
     */
    update: async (id: string, dto: BlogCommentUpdateDTO): Promise<BlogCommentResponseDTO> => {
        const response = await apiClient.patch<BlogCommentResponseDTO>(`/api/comments/${id}`, dto);
        return transformComment(response.data);
    },

    /**
     * Delete a comment
     */
    delete: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.delete<{ success: boolean; message: string }>(`/api/comments/${id}`);
        return response.data;
    },
};
