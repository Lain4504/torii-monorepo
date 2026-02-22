import { apiClient } from '../api-client';
import type {
    BlogQueryDTO,
    BlogResponseDTO,
    StandardApiResponse,
    PaginatedApiResponse
} from '@workspace/schemas';

/**
 * API client for Blogs
 */
export const blogApi = {
    /**
     * Get all blogs with pagination and filters
     */
    findAll: async (params: BlogQueryDTO = { page: 1, limit: 12 }): Promise<PaginatedApiResponse<BlogResponseDTO>> => {
        const response = await apiClient.post<PaginatedApiResponse<BlogResponseDTO>>('/api/blogs/search', params);

        // Backend returns: { success: true, data: [...], total, page, limit, totalPages }
        const responseData = response.data;
        if (!responseData.success || !responseData.data) {
            throw new Error('Invalid response format from server');
        }

        return response.data;
    },

    /**
     * Get blog by ID
     */
    findById: async (id: string): Promise<BlogResponseDTO> => {
        const response = await apiClient.get<StandardApiResponse<{ blog: BlogResponseDTO }>>(`/api/blogs/${id}`);

        const responseData = response.data;
        if (!responseData.success || !responseData.data) {
            throw new Error('Invalid response format from server');
        }

        return responseData.data.blog;
    },

    /**
     * Get blog by slug
     */
    findBySlug: async (slug: string): Promise<BlogResponseDTO | null> => {
        try {
            const response = await apiClient.get<StandardApiResponse<{ blog: BlogResponseDTO }>>(`/api/blogs/slug/${slug}`);

            const responseData = response.data;
            if (!responseData.success || !responseData.data) {
                return null;
            }

            return responseData.data.blog;
        } catch (error) {
            console.error('Failed to fetch blog by slug:', error);
            return null;
        }
    },

    /**
     * Increment view count for a blog
     */
    incrementViewCount: async (id: string): Promise<void> => {
        try {
            await apiClient.patch(`/api/blogs/${id}/view`);
        } catch (error) {
            // Silent fail - don't block the UI if view count fails
            console.error('Failed to increment view count:', error);
        }
    },
};
