import { apiClient } from '../api-client';
import type { 
    CommentCreateDTO, 
    CommentUpdateDTO, 
    CommentQueryDTO, 
    CommentResponseDTO,
    CommentPaginatedResponse
} from '@workspace/schemas';

/**
 * Helper to transform backend Prisma response to frontend DTO
 * Handles mapping nulls to undefined/0
 */
const transformComment = (data: any): CommentResponseDTO => {
    if (!data) return data;
    try {
        return {
            ...data,
            parentId: data.parentCommentId || data.parentId || undefined,
            likeCount: data.likes || data.likeCount || 0,
            replies: data.replies?.map(transformComment),
        };
    } catch (error) {
        console.error('Error transforming comment:', error, data);
        // Return data as-is if transformation fails
        return data;
    }
};

/**
 * API client for Post Comments
 */
export const postCommentApi = {
    /**
     * Get all comments for a post
     */
    findAll: async (params: CommentQueryDTO): Promise<CommentPaginatedResponse> => {
        try {
            const response = await apiClient.get<{ success: boolean; data: CommentResponseDTO[]; total: number; page: number; limit: number; totalPages: number }>('/api/comments', {
                params,
            });
            
            // Backend returns: { success: true, data: [...], total, page, limit, totalPages }
            const responseData = response.data;
            
            if (!responseData || !responseData.success) {
                console.error('Invalid response from server:', responseData);
                throw new Error('Invalid response format from server');
            }
            
            if (!responseData.data || !Array.isArray(responseData.data)) {
                console.error('Response data is not an array:', responseData);
                throw new Error('Response data is not an array');
            }
            
            return {
                data: responseData.data.map(transformComment),
                total: responseData.total || 0,
                page: responseData.page || 1,
                limit: responseData.limit || 20,
                totalPages: responseData.totalPages || 0,
            };
        } catch (error: any) {
            console.error('Error in postCommentApi.findAll:', error);
            console.error('Request params:', params);
            if (error.response) {
                console.error('Response status:', error.response.status);
                console.error('Response data:', error.response.data);
            }
            throw error;
        }
    },

    /**
     * Get comment with its replies
     */
    getWithReplies: async (id: string, depth: number = 2): Promise<CommentResponseDTO> => {
        const response = await apiClient.get<{ success: boolean; data: CommentResponseDTO }>(`/api/comments/${id}/replies`, {
            params: { depth },
        });
        
        // Backend returns: { success: true, data: {...} }
        const responseData = response.data;
        if (!responseData.success || !responseData.data) {
            throw new Error('Invalid response format from server');
        }
        
        return transformComment(responseData.data);
    },

    /**
     * Create a new comment
     */
    create: async (dto: CommentCreateDTO): Promise<CommentResponseDTO> => {
        const response = await apiClient.post<{ success: boolean; data: CommentResponseDTO; message?: string }>('/api/comments', dto);
        
        // Backend returns: { success: true, data: {...}, message?: string }
        const responseData = response.data;
        if (!responseData.success || !responseData.data) {
            throw new Error('Invalid response format from server');
        }
        
        return transformComment(responseData.data);
    },

    /**
     * Update a comment
     */
    update: async (id: string, dto: CommentUpdateDTO): Promise<CommentResponseDTO> => {
        const response = await apiClient.patch<{ success: boolean; data: CommentResponseDTO; message?: string }>(`/api/comments/${id}`, dto);
        
        // Backend returns: { success: true, data: {...}, message?: string }
        const responseData = response.data;
        if (!responseData.success || !responseData.data) {
            throw new Error('Invalid response format from server');
        }
        
        return transformComment(responseData.data);
    },

    /**
     * Delete a comment
     */
    delete: async (id: string): Promise<{ success: boolean; message: string }> => {
        const response = await apiClient.delete<{ success: boolean; message: string }>(`/api/comments/${id}`);
        return response.data;
    },
};
