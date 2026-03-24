import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client.ts';
import type { StaffDashboardResponseDTO, StandardApiResponse } from '@workspace/schemas';

// ============================================================================
// API Functions
// ============================================================================

export const staffDashboardApi = {
    // GET /api/staff/dashboard
    async getDashboardMetrics(): Promise<StaffDashboardResponseDTO> {
        const response = await apiClient.get<StandardApiResponse<StaffDashboardResponseDTO>>('/api/staff/dashboard');
        return response.data.data!;
    },
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook: Get staff dashboard metrics
 * Restricted to admin and staff-branch roles
 */
export function useStaffDashboard() {
    return useQuery({
        queryKey: ['staff-dashboard'],
        queryFn: () => staffDashboardApi.getDashboardMetrics(),
        staleTime: 60000, // 1 minute - dashboard data doesn't need frequent updates
        retry: 1, // Only retry once for permission errors
    });
}
