import { apiClient } from '../api-client';
import type { 
    PostQueryDTO, 
    PostResponseDTO, 
    PaginatedResponseDTO,
    StandardApiResponse,
    PaginatedApiResponse
} from '@workspace/schemas';

/**
 * API client for Posts
 */
export const postApi = {
    /**
     * Get all posts with pagination and filters
     */
    findAll: async (params: PostQueryDTO = { page: 1, limit: 12 }): Promise<PaginatedResponseDTO<PostResponseDTO>> => {
        const response = await apiClient.get<PaginatedApiResponse<PostResponseDTO>>('/api/posts', {
            params,
        });
        
        // Backend returns: { success: true, data: [...], total, page, limit, totalPages }
        const responseData = response.data;
        if (!responseData.success || !responseData.data) {
            throw new Error('Invalid response format from server');
        }
        
        return {
            data: responseData.data,
            total: responseData.total,
            page: responseData.page,
            limit: responseData.limit,
            totalPages: responseData.totalPages,
        };
    },

    /**
     * Get post by ID
     */
    findById: async (id: string): Promise<PostResponseDTO> => {
        const response = await apiClient.get<StandardApiResponse<PostResponseDTO>>(`/api/posts/${id}`);
        
        // Backend returns: { success: true, data: {...} }
        const responseData = response.data;
        if (!responseData.success || !responseData.data) {
            throw new Error('Invalid response format from server');
        }
        
        return responseData.data;
    },

    /**
     * Get post by slug
     */
    findBySlug: async (slug: string): Promise<PostResponseDTO | null> => {
        try {
            const response = await apiClient.get<StandardApiResponse<PostResponseDTO>>(`/api/posts/slug/${slug}`);
            
            // Backend returns: { success: true, data: {...} }
            const responseData = response.data;
            if (!responseData.success || !responseData.data) {
                return null;
            }
            
            return responseData.data;
        } catch (error) {
            console.error('Failed to fetch post by slug:', error);
            return null;
        }
    },

    /**
     * Increment view count for a post
     */
    incrementViewCount: async (id: string): Promise<void> => {
        try {
            await apiClient.patch(`/api/posts/${id}/view`);
        } catch (error) {
            // Silent fail - don't block the UI if view count fails
            console.error('Failed to increment view count:', error);
        }
    },
};
