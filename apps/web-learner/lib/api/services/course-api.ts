import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type {
  StandardApiResponse,
  PaginatedApiResponse
} from '@workspace/schemas';

export interface CurriculumLesson {
  id: string;
  title: string;
  contentType: 'video' | 'document' | 'assignment' | 'quiz';
  videoDuration?: number;
  isUnlocked: boolean;
  isPreview: boolean;
  order: number;
}

export interface CurriculumModule {
  id: string;
  title: string;
  order: number;
  durationMinutes?: number;
  lessons: CurriculumLesson[];
}

export interface CurriculumResponse {
  courseId: string;
  modules: CurriculumModule[];
}

export const courseApi = {
  /**
   * Get all courses with pagination and filters
   */
  findAll: async (params: {
    page?: number;
    limit?: number;
    level?: string;
    subject?: string;
    q?: string;
    type?: 'VOD' | 'LIVE';
  } = {}): Promise<PaginatedApiResponse<any>> => {
    const response = await apiClient.get<StandardApiResponse<{ items: any[] }>>('/api/academy/course-profiles', {
      params,
    });
    // Adapt to PaginatedApiResponse structure
    return {
      success: response.data.success,
      data: (response.data.data as any)?.items ?? [],
      total: (response.data.data as any)?.total ?? ((response.data.data as any)?.items?.length ?? 0),
      page: (response.data.data as any)?.page ?? 1,
      limit: (response.data.data as any)?.limit ?? 10,
      totalPages: (response.data.data as any)?.totalPages ?? 1,
    } as any;
  },

  /**
   * Get course by id
   */
  getCourseById: async (id: string): Promise<any | null> => {
    const response = await apiClient.get<StandardApiResponse<{ item: any }>>(`/api/academy/course-profiles/${id}`);
    return response.data.data!.item;
  },

  /**
   * Get courses by type (VOD | LIVE)
   */
  getByType: async (type: 'VOD' | 'LIVE'): Promise<any[]> => {
    const response = await apiClient.get<StandardApiResponse<{ items: any[] }>>('/api/academy/course-profiles', {
      params: { type },
    });
    return response.data.data?.items ?? [];
  },
};

/**
 * Hook: Get all courses with filters
 */
export function useCourses(params: any) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => courseApi.findAll(params),
  });
}

/**
 * Hook: Get course by ID
 */
export function useCourseById(courseId?: string) {
  return useQuery({
    queryKey: ['courses', 'id', courseId],
    queryFn: () => courseApi.getCourseById(courseId!),
    enabled: !!courseId,
  });
}

/**
 * Hook: Get live courses only (type === 'LIVE')
 */
export function useLiveCourses() {
  return useQuery({
    queryKey: ['courses', 'LIVE'],
    queryFn: () => courseApi.getByType('LIVE'),
  });
}
