import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type {
  CourseMasterResponseDTO,
  CourseMasterSearchResponseDTO,
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
    jlptLevel?: string;
    status?: string;
    search?: string;
  } = {}): Promise<PaginatedApiResponse<CourseMasterResponseDTO>> => {
    const response = await apiClient.get<PaginatedApiResponse<CourseMasterResponseDTO>>('/api/course-masters', {
      params,
    });
    return response.data;
  },

  /**
   * Advanced search for courses
   */
  advancedSearch: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    levels?: string; // comma separated
    priceMin?: number;
    priceMax?: number;
    rating?: number;
    sort?: string;
  } = {}): Promise<PaginatedApiResponse<CourseMasterSearchResponseDTO>> => {
    const response = await apiClient.get<PaginatedApiResponse<CourseMasterSearchResponseDTO>>('/api/course-masters/advanced-search', {
      params,
    });
    return response.data;
  },

  /**
   * Validate if a course is ready for scheduling
   */
  validateForScheduling: async (courseId: string): Promise<{ isReady: boolean; message?: string }> => {
    const response = await apiClient.get<StandardApiResponse<{ isReady: boolean; message?: string }>>(`/api/course-masters/${courseId}/validate-scheduling`);
    return response.data.data!;
  },

  /**
   * Get course by slug
   */
  getCourseBySlug: async (slug: string): Promise<CourseMasterResponseDTO | null> => {
    const response = await apiClient.get<StandardApiResponse<{ course: CourseMasterResponseDTO }>>(`/api/course-masters/slug/${slug}`);
    return response.data.data!.course;
  },

  /**
   * Get course by id
   */
  getCourseById: async (id: string): Promise<CourseMasterResponseDTO | null> => {
    const response = await apiClient.get<StandardApiResponse<{ course: CourseMasterResponseDTO }>>(`/api/course-masters/${id}`);
    return response.data.data!.course;
  },

  /**
   * Get course curriculum (modules with lessons)
   */
  getCurriculum: async (courseId: string): Promise<CurriculumResponse> => {
    const response = await apiClient.get<StandardApiResponse<CurriculumResponse>>(`/api/course-masters/${courseId}/curriculum`);
    return response.data.data!;
  },

  /**
   * Get courses by type (vod | live)
   */
  getByType: async (type: 'vod' | 'live'): Promise<CourseMasterResponseDTO[]> => {
    const response = await apiClient.get<StandardApiResponse<{ courses: CourseMasterResponseDTO[] }>>(`/api/course-masters/by-type/${type}`);
    return response.data.data?.courses ?? [];
  },

  /**
   * Get student count for a course
   */
  getStudentCount: async (courseId: string): Promise<{ count: number }> => {
    const response = await apiClient.get<StandardApiResponse<{ count: number }>>(`/api/course-masters/${courseId}/students/count`);
    return response.data.data!;
  },
};

/**
 * Hook: Search courses for public catalog
 */
export function useCourses(params: {
  page?: number;
  limit?: number;
  levels?: string[];
  q?: string;
  priceFilter?: 'all' | 'free' | 'paid';
  sortBy?: string;
  instructorId?: string;
  topics?: string[];
}) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: async () => {
      let priceMin: number | undefined;
      let priceMax: number | undefined;

      if (params.priceFilter === 'free') {
        priceMax = 0;
      } else if (params.priceFilter === 'paid') {
        priceMin = 1;
      }

      const levelsString = params.levels?.length ? params.levels.join(',') : undefined;

      return courseApi.advancedSearch({
        page: params.page,
        limit: params.limit,
        search: params.q,
        levels: levelsString,
        priceMin,
        priceMax,
        sort: params.sortBy,
        instructorId: params.instructorId,
        topics: params.topics?.length ? params.topics.join(',') : undefined,
      } as any);
    },
  });
}


/**
 * Hook: Get course by slug
 */
export function useCourseBySlug(slug: string) {
  return useQuery({
    queryKey: ['courses', 'slug', slug],
    queryFn: () => courseApi.getCourseBySlug(slug),
    enabled: !!slug,
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
 * Hook: Get curriculum
 */
export function useCurriculum(courseId?: string) {
  return useQuery({
    queryKey: ['curriculum', courseId],
    queryFn: () => courseApi.getCurriculum(courseId!),
    enabled: !!courseId,
  });
}

/**
 * Hook: Get live courses only (type === 'live')
 */
export function useLiveCourses() {
  return useQuery({
    queryKey: ['courses', 'live'],
    queryFn: () => courseApi.getByType('live'),
  });
}

/**
 * Hook: Get student count
 */
export function useStudentCount(courseId?: string) {
  return useQuery({
    queryKey: ['courses', courseId, 'studentCount'],
    queryFn: () => courseApi.getStudentCount(courseId!),
    enabled: !!courseId,
  });
}
