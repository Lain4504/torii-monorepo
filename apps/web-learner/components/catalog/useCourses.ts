import { useQuery } from '@tanstack/react-query';
import { coursesApi, CoursesListResponse } from '@/api/services/courses-api';

/**
 * Hook to fetch courses list with filtering and pagination
 */
export function useCourses(params: {
  page?: number;
  limit?: number;
  level?: string;
  type?: string;
  q?: string;
}) {
  return useQuery<CoursesListResponse>({
    queryKey: ['courses', params],
    queryFn: async () => {
      return coursesApi.getList({
        page: params.page,
        limit: params.limit,
        jlptLevel: params.level,
        type: params.type,
        search: params.q,
      });
    },
  });
}
