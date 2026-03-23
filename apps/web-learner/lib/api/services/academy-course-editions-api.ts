import { useQuery } from '@tanstack/react-query';
import type { AcademyCourseEditionModel } from '@workspace/schemas';
import type { StandardApiResponse } from '@workspace/schemas';
import { apiClient } from '../api-client';

export const academyCourseEditionsApi = {
  async getPublic(params: { isActive?: boolean } = {}) {
    const response = await apiClient.get<
      StandardApiResponse<{ items: AcademyCourseEditionModel[] }>
    >('/api/academy/course-editions/public', { params });
    return response.data.data?.items ?? [];
  },
};

export function useAcademyCourseEditions(params: { isActive?: boolean } = {}) {
  return useQuery({
    queryKey: ['academy-course-editions', params],
    queryFn: () => academyCourseEditionsApi.getPublic(params),
  });
}

