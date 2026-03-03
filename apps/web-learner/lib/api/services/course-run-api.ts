import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type {
    PaginatedApiResponse,
    CourseRunResponseDTO,
    CourseRunSearchRequestDTO,
    StandardApiResponse
} from '@workspace/schemas';

export const courseRunApi = {
    /**
     * Get all course runs with pagination and filters
     */
    findAll: async (params: CourseRunSearchRequestDTO): Promise<PaginatedApiResponse<CourseRunResponseDTO>> => {
        const response = await apiClient.get<PaginatedApiResponse<CourseRunResponseDTO>>('/api/course-runs', {
            params,
        });
        return response.data;
    },

    /**
     * Get course run by ID
     */
    getCourseRunById: async (id: string): Promise<CourseRunResponseDTO | null> => {
        const response = await apiClient.get<StandardApiResponse<{ run: CourseRunResponseDTO }>>(
            `/api/course-runs/${id}`,
        );
        return (response.data.data as any)?.run ?? null;
    },

    /**
     * Get course run by slug
     */
    getCourseRunBySlug: async (slug: string): Promise<CourseRunResponseDTO | null> => {
        const response = await apiClient.get<StandardApiResponse<{ run: CourseRunResponseDTO }>>(
            `/api/course-runs/slug/${slug}`,
        );
        return (response.data.data as any)?.run ?? null;
    },

    /**
     * Get available course runs for a specific course
     */
    getAvailableRuns: async (courseId: string): Promise<CourseRunResponseDTO[]> => {
        const response = await apiClient.get<PaginatedApiResponse<CourseRunResponseDTO>>('/api/course-runs', {
            params: {
                courseId,
                status: 'ENROLLING',
                page: 1,
                limit: 20
            }
        });
        return response.data.data ?? [];
    },
};

/**
 * Hook: Get course runs with filters
 */
export function useCourseRuns(params: CourseRunSearchRequestDTO) {
    return useQuery({
        queryKey: ['course-runs', params],
        queryFn: () => courseRunApi.findAll(params),
    });
}

/**
 * Hook: Get available course runs for enrollment
 */
export function useAvailableCourseRuns(courseId?: string) {
    return useQuery({
        queryKey: ['available-course-runs', courseId],
        queryFn: () => courseRunApi.getAvailableRuns(courseId!),
        enabled: !!courseId,
    });
}
/**
 * Hook: Get course run by ID
 */
export function useCourseRun(id?: string) {
    return useQuery({
        queryKey: ['course-runs', id],
        queryFn: () => courseRunApi.getCourseRunById(id!),
        enabled: !!id,
    });
}

/**
 * Hook: Get course run by Slug
 */
export function useCourseRunBySlug(slug?: string) {
    return useQuery({
        queryKey: ['course-runs', 'slug', slug],
        queryFn: () => courseRunApi.getCourseRunBySlug(slug!),
        enabled: !!slug,
    });
}
