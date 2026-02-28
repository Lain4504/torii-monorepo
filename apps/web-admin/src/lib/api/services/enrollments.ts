import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client.ts';
import type { EnrollmentResponseDTO, StandardApiResponse } from '@workspace/schemas';

// ============================================================================
// API Functions
// ============================================================================

export const enrollmentsApi = {
    // GET /api/enrollments/course/:courseId
    async findByCourse(courseId: string): Promise<EnrollmentResponseDTO[]> {
        const response = await apiClient.get<StandardApiResponse<EnrollmentResponseDTO[]>>(`/api/enrollments/course/${courseId}`);
        return response.data.data!;
    },
};

// ============================================================================
// React Query Hooks
// ============================================================================

export function useEnrollmentsByCourse(courseId: string) {
    return useQuery({
        queryKey: ['enrollments', 'course', courseId],
        queryFn: () => enrollmentsApi.findByCourse(courseId),
        enabled: !!courseId,
    });
}
