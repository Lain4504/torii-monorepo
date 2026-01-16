import { apiClient } from '../api-client';
import type {
    PostQueryDTO,
    PostResponseDTO,
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
    findAll: async (params: PostQueryDTO = { page: 1, limit: 12 }): Promise<PaginatedApiResponse<PostResponseDTO>> => {
        const response = await apiClient.get<PaginatedApiResponse<PostResponseDTO>>('/api/posts', {
            params,
        });

        // Backend returns: { success: true, data: [...], total, page, limit, totalPages }
        const responseData = response.data;
        if (!responseData.success || !responseData.data) {
            throw new Error('Invalid response format from server');
        }

        return response.data;
    },

    /**
     * Get post by ID
     */
    findById: async (id: string): Promise<PostResponseDTO> => {
        const response = await apiClient.get<StandardApiResponse<{ post: PostResponseDTO }>>(`/api/posts/${id}`);

        const responseData = response.data;
        if (!responseData.success || !responseData.data) {
            throw new Error('Invalid response format from server');
        }

        return responseData.data.post;
    },

    /**
     * Get post by slug
     */
    findBySlug: async (slug: string): Promise<PostResponseDTO | null> => {
        try {
            const response = await apiClient.get<StandardApiResponse<{ post: PostResponseDTO }>>(`/api/posts/slug/${slug}`);

            const responseData = response.data;
            if (!responseData.success || !responseData.data) {
                return null;
            }

            return responseData.data.post;
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
