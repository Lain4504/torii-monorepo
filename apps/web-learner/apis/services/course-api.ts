import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type { CourseResponseDTO, PaginatedResponseDTO } from '@workspace/schemas';

export interface CurriculumModule {
  id: string;
  title: string;
  description?: string;
  order: number;
  durationMinutes?: number;
  lessons: Array<{
    id: string;
    title: string;
    contentType: string;
    videoDuration?: number;
    order: number;
    isPreview: boolean;
    isUnlocked: boolean;
  }>;
}

export interface CurriculumResponse {
  modules: CurriculumModule[];
}

export interface CourseQueryParams {
  page?: number;
  limit?: number;
  jlptLevel?: string;
  status?: string;
  search?: string;
}

export const courseApi = {
  /**
   * Get all courses with pagination and filters
   */
  findAll: async (params: CourseQueryParams = {}): Promise<PaginatedResponseDTO<CourseResponseDTO>> => {
    const response = await apiClient.get<PaginatedResponseDTO<CourseResponseDTO>>('/api/courses', {
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
    q?: string;
    levels?: string; // comma separated
    priceMin?: number;
    priceMax?: number;
    rating?: number;
    sort?: string;
  } = {}): Promise<PaginatedResponseDTO<CourseResponseDTO>> => {
    const response = await apiClient.get<PaginatedResponseDTO<CourseResponseDTO>>('/api/courses/advanced-search', {
      params,
    });
    return response.data;
  },

  /**
   * Get course by slug
   */
  getCourseBySlug: async (slug: string): Promise<CourseResponseDTO | null> => {
    const response = await apiClient.get<CourseResponseDTO>(`/api/courses/slug/${slug}`);
    return response.data;
  },

  /**
   * Get course by id
   */
  getCourseById: async (id: string): Promise<CourseResponseDTO | null> => {
    const response = await apiClient.get<CourseResponseDTO>(`/api/courses/${id}`);
    return response.data;
  },

  /**
   * Get course curriculum (modules with lessons)
   */
  getCurriculum: async (courseId: string): Promise<CurriculumResponse> => {
    const response = await apiClient.get<CurriculumResponse>(`/api/courses/${courseId}/curriculum`);
    return response.data;
  },
};

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
 * Hook: Get curriculum
 */
export function useCurriculum(courseId?: string) {
  return useQuery({
    queryKey: ['curriculum', courseId],
    queryFn: () => courseApi.getCurriculum(courseId!),
    enabled: !!courseId,
  });
}







