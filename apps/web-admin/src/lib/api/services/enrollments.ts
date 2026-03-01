import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client.ts';
import type { EnrollmentResponseDTO, StandardApiResponse } from '@workspace/schemas';

// ============================================================================
// API Functions
// ============================================================================

export const enrollmentsApi = {
    // GET /api/enrollments/check/:courseMasterId
    async findByCourse(courseMasterId: string): Promise<EnrollmentResponseDTO[]> {
        const response = await apiClient.get<StandardApiResponse<EnrollmentResponseDTO[]>>(`/api/enrollments/check/${courseMasterId}`);
        return response.data.data!;
    },
};

// ============================================================================
// React Query Hooks
// ============================================================================

export function useEnrollmentsByCourse(courseMasterId: string) {
    return useQuery({
        queryKey: ['enrollments', 'course', courseMasterId],
        queryFn: () => enrollmentsApi.findByCourse(courseMasterId),
        enabled: !!courseMasterId,
    });
}
