import { apiClient } from '../api-client';
import type {
    CommentCreateDTO,
    CommentUpdateDTO,
    CommentQueryDTO,
    CommentResponseDTO,
    CommentPaginatedResponse,
    StandardApiResponse,
    PaginatedApiResponse,
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
            // Transform frontend params (postId/qaId) to backend format (entityId/targetType)
            const backendParams: any = { ...params };

            // Remove postId/qaId and replace with entityId/targetType
            if ((params as any).postId) {
                backendParams.entityId = (params as any).postId;
                backendParams.targetType = 'BLOG';
                delete backendParams.postId;
            } else if ((params as any).qaId) {
                backendParams.entityId = (params as any).qaId;
                backendParams.targetType = 'QA';
                delete backendParams.qaId;
            }

            const response = await apiClient.get<PaginatedApiResponse<CommentResponseDTO>>('/api/comments', {
                params: backendParams,
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
        const response = await apiClient.get<StandardApiResponse<CommentResponseDTO>>(`/api/comments/${id}/replies`, {
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
        // Transform frontend DTO (postId/qaId) to backend format (entityId/targetType)
        const backendDto: any = { ...dto };

        if ((dto as any).postId) {
            backendDto.entityId = (dto as any).postId;
            backendDto.targetType = 'BLOG';
            delete backendDto.postId;
        } else if ((dto as any).qaId) {
            backendDto.entityId = (dto as any).qaId;
            backendDto.targetType = 'QA';
            delete backendDto.qaId;
        }

        const response = await apiClient.post<StandardApiResponse<CommentResponseDTO>>('/api/comments', backendDto);

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
        const response = await apiClient.patch<StandardApiResponse<CommentResponseDTO>>(`/api/comments/${id}`, dto);

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

    toggleLike: async (id: string): Promise<{ isLiked: boolean; likeCount: number }> => {
        const response = await apiClient.post<StandardApiResponse<{ isLiked: boolean; likeCount: number }>>(`/api/comments/${id}/like`);
        if (!response.data.data) {
            throw new Error('Invalid response format from server');
        }
        return response.data.data;
    },
};
