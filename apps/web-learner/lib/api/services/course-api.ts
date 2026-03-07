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

export const offeringApi = {
  /**
   * Get all course offerings with pagination and filters
   */
  findAll: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    q?: string;
  } = {}): Promise<PaginatedApiResponse<any>> => {
    const response = await apiClient.get<StandardApiResponse<{ items: any[] }>>('/api/academy/course-offerings', {
      params: {
        status: 'ACTIVE',
        ...params,
      },
    });
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
   * Get offering by id (includes curriculum)
   */
  getById: async (id: string): Promise<any | null> => {
    const response = await apiClient.get<StandardApiResponse<{ item: any }>>(`/api/academy/course-offerings/${id}`);
    return response.data.data!.item;
  },
};

export const courseApi = {
  /**
   * Get all courses with pagination and filters (Legacy/Internal)
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
 * Hook: Get all course offerings with filters
 */
export function useCourses(params?: any) {
  return useQuery({
    queryKey: ['course-offerings', params],
    queryFn: () => offeringApi.findAll(params),
  });
}

/**
 * Hook: Get course offering by ID
 */
export function useCourseOffering(id?: string) {
  return useQuery({
    queryKey: ['course-offerings', 'id', id],
    queryFn: () => offeringApi.getById(id!),
    enabled: !!id,
  });
}

/**
 * Hook: Get course by ID (Legacy)
 */
export function useCourseById(courseId?: string) {
  return useQuery({
    queryKey: ['courses', 'id', courseId],
    queryFn: () => courseApi.getCourseById(courseId!),
    enabled: !!courseId,
  });
}

/**
 * Hook: Get live courses only (Uses offerings now)
 */
export function useLiveCourses() {
  return useQuery({
    queryKey: ['course-offerings', 'LIVE'],
    queryFn: () => offeringApi.findAll({ type: 'COURSE' }).then(res =>
      res.data.filter((o: any) =>
        o.classes?.some((c: any) => c.class?.mode === 'LIVE')
      )
    ),
  });
}
