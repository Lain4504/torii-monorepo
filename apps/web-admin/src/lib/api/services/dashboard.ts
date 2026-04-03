import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client.ts';
import type {
  AdminDashboardResponseDTO,
  StaffAcademicDashboardResponseDTO,
  StaffOperationsDashboardResponseDTO,
  StandardApiResponse,
} from '@workspace/schemas';

export const dashboardApi = {
  // GET /api/dashboard/staff-academic
  async getStaffAcademicDashboard(): Promise<StaffAcademicDashboardResponseDTO> {
    const response =
      await apiClient.get<StandardApiResponse<StaffAcademicDashboardResponseDTO>>(
        '/api/dashboard/staff-academic',
      );
    return response.data.data!;
  },

  // GET /api/dashboard/staff-operations
  async getStaffOperationsDashboard(): Promise<StaffOperationsDashboardResponseDTO> {
    const response =
      await apiClient.get<StandardApiResponse<StaffOperationsDashboardResponseDTO>>(
        '/api/dashboard/staff-operations',
      );
    return response.data.data!;
  },

  // GET /api/dashboard/admin
  async getAdminDashboard(): Promise<AdminDashboardResponseDTO> {
    const response =
      await apiClient.get<StandardApiResponse<AdminDashboardResponseDTO>>(
        '/api/dashboard/admin',
      );
    return response.data.data!;
  },
};

export function useStaffAcademicDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'staff-academic'],
    queryFn: () => dashboardApi.getStaffAcademicDashboard(),
    staleTime: 60_000,
    retry: 1,
  });
}

export function useStaffOperationsDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'staff-operations'],
    queryFn: () => dashboardApi.getStaffOperationsDashboard(),
    staleTime: 60_000,
    retry: 1,
  });
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['dashboard', 'admin'],
    queryFn: () => dashboardApi.getAdminDashboard(),
    staleTime: 60_000,
    retry: 1,
  });
}

