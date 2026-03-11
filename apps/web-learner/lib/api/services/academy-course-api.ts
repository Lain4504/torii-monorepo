import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type {
  StandardApiResponse,
  PaginatedApiResponse
} from '@workspace/schemas';

function normalizeOfferingForLearner(item: any) {
  const classes = Array.isArray(item?.classes) ? item.classes : [];
  const firstClass = classes[0]?.class;
  const profile = firstClass?.courseProfile;
  const classModes = classes
    .map((entry: any) => entry?.class?.mode)
    .filter(Boolean);
  const hasLiveClass = classModes.includes('LIVE');

  const rawPrice = item?.originalPrice ?? item?.price ?? 0;
  const parsedPrice = Number(rawPrice);

  return {
    ...item,
    price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
    thumbnailUrl:
      item?.thumbnailUrl ||
      profile?.thumbnailUrl ||
      item?.metadata?.thumbnailUrl ||
      null,
    jlptLevel:
      item?.jlptLevel ||
      profile?.level ||
      item?.metadata?.level ||
      null,
    isLive: hasLiveClass,
    // Frontend tabs currently rely on type === 'LIVE' | 'VOD'
    type: hasLiveClass ? 'LIVE' : 'VOD',
  };
}

export const academyOfferingApi = {
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
    const { status: _status, ...restParams } = params;
    const response = await apiClient.get<StandardApiResponse<{ items: any[]; total: number; page: number; limit: number; totalPages: number }>>('/api/academy/course-offerings/public', {
      params: {
        status: 'PUBLISHED',
        ...restParams,
      },
    });
    const data = response.data.data!;
    const now = new Date();
    const visibleItems = (data.items ?? []).filter((item: any) => {
      const fromOk = !item.validFrom || new Date(item.validFrom) <= now;
      const toOk = !item.validTo || new Date(item.validTo) >= now;
      return fromOk && toOk;
    });
    const normalizedItems = visibleItems.map(normalizeOfferingForLearner);
    return {
      success: response.data.success,
      data: normalizedItems,
      total: normalizedItems.length,
      page: data.page ?? 1,
      limit: data.limit ?? 10,
      totalPages: data.totalPages ?? 1,
    };
  },

  /**
   * Get all publicly visible offerings
   */
  findAllPublic: async (params: {
    page?: number;
    limit?: number;
    status?: string;
    type?: string;
    q?: string;
  } = {}): Promise<PaginatedApiResponse<any>> => {
    const { status: _status, ...restParams } = params;
    const response = await apiClient.get<StandardApiResponse<{ items: any[]; total: number; page: number; limit: number; totalPages: number }>>('/api/academy/course-offerings/public', {
      params: {
        status: 'PUBLISHED',
        ...restParams,
      },
    });
    const data = response.data.data!;
    const now = new Date();
    const visibleItems = (data.items ?? []).filter((item: any) => {
      const fromOk = !item.validFrom || new Date(item.validFrom) <= now;
      const toOk = !item.validTo || new Date(item.validTo) >= now;
      return fromOk && toOk;
    });
    const normalizedItems = visibleItems.map(normalizeOfferingForLearner);
    return {
      success: response.data.success,
      data: normalizedItems,
      total: normalizedItems.length,
      page: data.page ?? 1,
      limit: data.limit ?? 10,
      totalPages: data.totalPages ?? 1,
    };
  },

  /**
   * Get offering by id (includes curriculum)
   */
  getById: async (id: string): Promise<any | null> => {
    const response = await apiClient.get<StandardApiResponse<{ item: any }>>(`/api/academy/course-offerings/public/${id}`);
    return normalizeOfferingForLearner(response.data.data!.item);
  },

  /**
   * Get public offering by id
   */
  getPublicById: async (id: string): Promise<any | null> => {
    const response = await apiClient.get<StandardApiResponse<{ item: any }>>(`/api/academy/course-offerings/public/${id}`);
    return normalizeOfferingForLearner(response.data.data!.item);
  },
};

export const academyCourseApi = {
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
    const response = await apiClient.get<StandardApiResponse<{ items: any[]; total: number; page: number; limit: number; totalPages: number }>>('/api/academy/course-profiles', {
      params,
    });
    const data = response.data.data!;
    return {
      success: response.data.success,
      data: data.items ?? [],
      total: data.total ?? 0,
      page: data.page ?? 1,
      limit: data.limit ?? 10,
      totalPages: data.totalPages ?? 1,
    };
  },

  /**
   * Get course by id
   */
  getCourseById: async (id: string): Promise<any | null> => {
    const response = await apiClient.get<StandardApiResponse<{ item: any }>>(`/api/academy/course-profiles/${id}`);
    return response.data.data!.item;
  },
};

/**
 * Hook: Get all course offerings with filters
 */
export function useAcademyOfferings(params?: any) {
  return useQuery({
    queryKey: ['academy-course-offerings', params],
    queryFn: () => academyOfferingApi.findAllPublic(params),
  });
}

/**
 * Hook: Get course offering by ID
 */
export function useAcademyOffering(id?: string) {
  return useQuery({
    queryKey: ['academy-course-offerings', 'id', id],
    queryFn: () => academyOfferingApi.getPublicById(id!),
    enabled: !!id,
    retry: false,
  });
}

/**
 * Hook: Get course by ID
 */
export function useAcademyCourseById(courseId?: string) {
  return useQuery({
    queryKey: ['academy-course-profiles', 'id', courseId],
    queryFn: () => academyCourseApi.getCourseById(courseId!),
    enabled: !!courseId,
    retry: false,
  });
}
