import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type {
  StandardApiResponse,
  PaginatedApiResponse
} from '@workspace/schemas';

function normalizeOfferingForLearner(item: any) {
  if (!item) return null;

  const primaryClass = item.class ?? null;
  const profile =
    primaryClass?.courseProfile ||
    item.class?.courseProfile ||
    item.courseProfile;

  // Map CourseProfile (modules/lessons) → courseEdition.chapters (dùng khi không có edition từ lớp)
  let courseEdition = primaryClass?.courseEdition;

  if (!courseEdition && profile?.modules && Array.isArray(profile.modules)) {
    const chapters = profile.modules.map((mod: any) => ({
      id: mod.id,
      title: mod.title,
      description: null,
      items: (mod.lessons ?? []).map((lesson: any) => ({
        id: lesson.id,
        title: lesson.title,
        kind: lesson.type || 'VIDEO',
      })),
      estimatedMinutes: null,
    }));
    courseEdition = { chapters };
  }

  let classes =
    item.classes && Array.isArray(item.classes) && item.classes.length > 0
      ? item.classes
      : primaryClass
        ? [primaryClass]
        : [];

  const siblingClasses = Array.isArray(item.siblingClasses) ? item.siblingClasses : [];
  // Gói LIVE gắn term: API trả siblingClasses (lớp cùng kỳ), không set item.class
  if (item.mode === 'LIVE' && siblingClasses.length > 0) {
    classes = siblingClasses;
  }

  const isLive = item.mode === 'LIVE';

  const rawPrice = item.originalPrice ?? item.price ?? 0;
  const parsedPrice = Number(rawPrice);

  const normalizedClasses = classes.map((cls: any) => {
    if (courseEdition && !Array.isArray(cls.courseEdition?.chapters)) {
      return { ...cls, courseEdition };
    }
    if (cls === primaryClass && courseEdition) {
      return { ...cls, courseEdition };
    }
    return cls;
  });

  return {
    ...item,
    classes: normalizedClasses,
    class: primaryClass,
    siblingClasses,
    /** Luôn có khi curriculum lấy từ courseProfile (kể cả LIVE không có class 1:1) */
    courseEdition: courseEdition ?? null,
    price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
    thumbnailUrl:
      item.thumbnailUrl ||
      profile?.thumbnailUrl ||
      item.metadata?.thumbnailUrl ||
      null,
    jlptLevel:
      item.jlptLevel ||
      profile?.level ||
      item.metadata?.level ||
      null,
    isLive,
    type: isLive ? 'LIVE' : 'VOD',
  };
}

export const academyOfferingApi = {
  /**
   * Get all course offerings with pagination and filters
   */
  findAllPublic: async (params: {
    page?: number;
    limit?: number;
    q?: string;
    mode?: 'VOD' | 'LIVE';
    hasEnrollableLiveClass?: boolean;
  } = {}): Promise<PaginatedApiResponse<any>> => {
    const response = await apiClient.get<StandardApiResponse<{ items: any[]; total: number; page: number; limit: number; totalPages: number }>>(
      '/api/academy/course-offerings/public',
      {
        params: {
          ...params,
          status: 'PUBLISHED',
        },
      }
    );

    const data = response.data.data!;
    const now = new Date();

    // Filter by validity dates and normalize
    const normalizedItems = (data.items ?? [])
      .filter((item: any) => {
        const fromOk = !item.validFrom || new Date(item.validFrom) <= now;
        const toOk = !item.validTo || new Date(item.validTo) >= now;
        return fromOk && toOk;
      })
      .map(normalizeOfferingForLearner);

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
   * Get public offering by id (includes curriculum)
   */
  getPublicById: async (id: string): Promise<any | null> => {
    const response = await apiClient.get<StandardApiResponse<{ item: any }>>(
      `/api/academy/course-offerings/public/${id}`
    );
    return normalizeOfferingForLearner(response.data.data!.item);
  },

  /**
   * Get public offerings by category (JLPT level)
   */
  findByCategory: async (category: string): Promise<PaginatedApiResponse<any>> => {
    const response = await apiClient.get<StandardApiResponse<{ items: any[] }>>(
      `/api/academy/course-offerings/public/category/${category}`
    );
    
    const data = response.data.data!;
    const normalizedItems = (data.items ?? []).map(normalizeOfferingForLearner);

    return {
      success: response.data.success,
      data: normalizedItems,
      total: normalizedItems.length,
      page: 1,
      limit: Math.max(normalizedItems.length, 1),
      totalPages: 1,
    };
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
 * Hook: Get course offerings by category (JLPT Level)
 */
export function useAcademyOfferingsByCategory(category: string) {
  return useQuery({
    queryKey: ['academy-course-offerings', 'category', category],
    queryFn: () => academyOfferingApi.findByCategory(category),
    enabled: !!category,
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
