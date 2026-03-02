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
        const response = await apiClient.get<StandardApiResponse<{ courseRun: CourseRunResponseDTO }>>(`/api/course-runs/${id}`);
        return response.data.data?.courseRun ?? null;
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
 * Hook: Get available course runs for enrollment
 */
export function useAvailableCourseRuns(courseId?: string) {
    return useQuery({
        queryKey: ['available-course-runs', courseId],
        queryFn: () => courseRunApi.getAvailableRuns(courseId!),
        enabled: !!courseId,
    });
}
