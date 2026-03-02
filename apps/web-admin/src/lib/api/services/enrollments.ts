import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client.ts';
import type { EnrollmentResponseDTO, StandardApiResponse } from '@workspace/schemas';

// ============================================================================
// API Functions
// ============================================================================

export const enrollmentsApi = {
    // GET /api/enrollments?courseMasterId=...
    async findByCourse(courseMasterId: string): Promise<EnrollmentResponseDTO[]> {
        const response = await apiClient.get<StandardApiResponse<{ data: EnrollmentResponseDTO[] }>>(
            '/api/enrollments',
            { params: { courseMasterId } }
        );
        // Gateway returns a paginated structure via successPaginatedResponse, but
        // here we only care about the data array.
        const anyData: any = response.data as any;
        const items: EnrollmentResponseDTO[] =
            anyData?.data?.data ?? anyData?.data?.items ?? anyData?.data ?? [];
        return items;
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
