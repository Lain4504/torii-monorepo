
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/api-client.ts';
import type { StandardApiResponse, PaginatedApiResponse } from '@workspace/schemas';

export interface ReviewResponseDTO {
    id: string;
    userId: string;
    courseId: string;
    rating: number;
    comment?: string;
    createdAt: Date;
    updatedAt: Date;
    user: {
        id: string;
        displayName: string;
        avatarUrl?: string;
    };
    courseTitle?: string;
}

export type ReviewQueryDTO = {
    page?: number;
    limit?: number;
    search?: string;
    rating?: number;
    courseId?: string;
};

// ============================================================================
// API Functions
// ============================================================================

export class ReviewsApi {
    // GET /api/courses/reviews
    static async findAll(params: ReviewQueryDTO): Promise<PaginatedApiResponse<ReviewResponseDTO>> {
        const response = await apiClient.get<PaginatedApiResponse<ReviewResponseDTO>>('/api/courses/reviews', { params });
        return response.data;
    }

    // GET /api/courses/reviews/:id
    static async findOne(id: string): Promise<ReviewResponseDTO> {
        const response = await apiClient.get<StandardApiResponse<ReviewResponseDTO>>(`/api/courses/reviews/${id}`);
        return response.data.data!;
    }

    // DELETE /api/courses/reviews/:id
    static async delete(id: string): Promise<boolean> {
        const response = await apiClient.delete<StandardApiResponse<boolean>>(`/api/courses/reviews/${id}`);
        return response.data.success;
    }
}

export const reviewsApi = ReviewsApi;

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook: Get reviews list with pagination and filters
 */
export function useReviews(params: ReviewQueryDTO) {
    return useQuery({
        queryKey: ['reviews', params],
        queryFn: () => reviewsApi.findAll(params),
        staleTime: 30000,
    });
}

/**
 * Hook: Get single review detail
 */
export function useReview(id: string | null) {
    return useQuery({
        queryKey: ['review', id],
        queryFn: () => reviewsApi.findOne(id!),
        enabled: !!id,
    });
}

/**
 * Hook: Delete review
 */
export function useDeleteReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => reviewsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reviews'] });
        },
    });
}
