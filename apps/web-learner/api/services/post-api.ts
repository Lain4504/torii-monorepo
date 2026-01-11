import { apiClient } from '../api-client';
import type { 
    BlogPostQueryDTO, 
    BlogPostResponseDTO, 
    PaginatedResponseDTO 
} from '@workspace/schemas';

/**
 * API client for Posts
 */
export const postApi = {
    /**
     * Get all posts with pagination and filters
     */
    findAll: async (params: BlogPostQueryDTO = { page: 1, limit: 12 }): Promise<PaginatedResponseDTO<BlogPostResponseDTO>> => {
        const response = await apiClient.get<PaginatedResponseDTO<BlogPostResponseDTO>>('/api/posts', {
            params,
        });
        return response.data;
    },

    /**
     * Get post by ID
     */
    findById: async (id: string): Promise<BlogPostResponseDTO> => {
        const response = await apiClient.get<BlogPostResponseDTO>(`/api/posts/${id}`);
        return response.data;
    },

    /**
     * Get post by slug
     */
    findBySlug: async (slug: string): Promise<BlogPostResponseDTO | null> => {
        try {
            const response = await apiClient.get<BlogPostResponseDTO>(`/api/posts/slug/${slug}`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch post by slug:', error);
            return null;
        }
    },
};
