import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type {
  StandardApiResponse,
  PaginatedApiResponse
} from '@workspace/schemas';
import { computeLearnerProductDisplay } from '@/lib/utils/learner-product-display';

function normalizeProductForLearner(item: any) {
  if (!item) return null;

  const primaryClass = item.class ?? null;
  const profile =
    primaryClass?.courseProfile ||
    item.class?.courseProfile ||
    item.courseProfile;

  // Map CourseProfile (modules/lessons) → curriculum.chapters
  let curriculum = null;

  if (profile?.modules && Array.isArray(profile.modules)) {
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
    curriculum = { chapters };
  }

  let classes =
    item.classes && Array.isArray(item.classes) && item.classes.length > 0
      ? item.classes
      : primaryClass
        ? [primaryClass]
        : [];

  const siblingClasses = Array.isArray(item.siblingClasses) ? item.siblingClasses : [];
  // Gói LIVE gắn cohort: API trả siblingClasses (lớp cùng đợt), không set item.class
  if (item.mode === 'LIVE' && siblingClasses.length > 0) {
    classes = siblingClasses;
  }

  const isLive = item.mode === 'LIVE';

  const rawPrice = item.originalPrice ?? item.price ?? 0;
  const parsedPrice = Number(rawPrice);

  const normalizedClasses = classes.map((cls: any) => {
    if (curriculum && !Array.isArray(cls.curriculum?.chapters)) {
      return { ...cls, curriculum };
    }
    if (cls === primaryClass && curriculum) {
      return { ...cls, curriculum };
    }
    return cls;
  });

  const display = computeLearnerProductDisplay(item, {
    isLive,
    primaryClass,
    profile,
    classesForCohort: normalizedClasses,
  });

  return {
    ...item,
    classes: normalizedClasses,
    class: primaryClass,
    siblingClasses,
    /** Luôn có khi curriculum lấy từ courseProfile (kể cả LIVE không có class 1:1) */
    curriculum: curriculum ?? null,
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
    learnerDisplayTitle: display.learnerDisplayTitle,
    learnerMarketingSubtitle: display.learnerMarketingSubtitle,
    liveContextLine: display.liveContextLine,
  };
}

/** Chỉ dùng cho checkout/preview và chi tiết khóa học. Hỗ trợ cả Cohort (LIVE) và VodPackage (VOD). */
export const academyProductApi = {
  getPublicById: async (id: string, type: 'LIVE' | 'VOD' = 'LIVE'): Promise<any | null> => {
    const endpoint = type === 'LIVE' ? `/api/academy/cohorts/public/${id}` : `/api/academy/vod-packages/public/${id}`;
    const response = await apiClient.get<StandardApiResponse<{ item: any }>>(endpoint);
    const item = response.data.data!.item as any;
    // Cohort/VOD public detail có thể chưa có field mode từ backend.
    return normalizeProductForLearner({
      ...item,
      mode: item?.mode ?? type,
      // LIVE detail trả liveClasses, normalize dùng siblingClasses/classes.
      siblingClasses:
        type === 'LIVE'
          ? (Array.isArray(item?.siblingClasses) ? item.siblingClasses : item?.liveClasses ?? [])
          : item?.siblingClasses,
      classes:
        type === 'LIVE'
          ? (Array.isArray(item?.classes) ? item.classes : item?.liveClasses ?? [])
          : item?.classes,
    });
  },
};

/** Lớp học (catalog learner) — không expose CourseOffering như đơn vị hiển thị; chỉ map giá/checkout qua catalogOfferingId. */
export const academyClassCatalogApi = {
  /**
   * Chuẩn hoá payload trả về từ `live-classes/public` để FE chỉ dùng:
   * - `price`: giá gốc
   * - `discountPrice`: giá giảm (hoặc null nếu không có giảm)
   */
  normalizePrice(item: any) {
    const isLive = item?.mode === 'LIVE' || !!item?.cohort

    const basePrice = Number(
      isLive
        ? item?.price ?? item?.catalogPrice ?? 0
        : item?.price ?? item?.catalogPrice ?? 0,
    )

    const discountRaw = Number(
      isLive
        ? item?.discountPrice ?? 0
        : item?.discountPrice ?? 0,
    )

    return {
      price: basePrice,
      discountPrice: discountRaw > 0 ? discountRaw : null,
    }
  },
  findPublic: async (params: {
    mode: 'LIVE' | 'VOD';
    level?: string;
    month?: string;
    q?: string;
  }): Promise<{ items: any[] }> => {
    const response = await apiClient.get<StandardApiResponse<{ items: any[] }>>(
      '/api/academy/live-classes/public',
      { params },
    );
    const data = response.data.data!;
    return {
      ...data,
      items: (data.items ?? []).map((it: any) => {
        const prices = academyClassCatalogApi.normalizePrice(it)
        return {
          ...it,
          ...prices,
        }
      }),
    }
  },

  getPublicById: async (id: string, mode?: 'LIVE' | 'VOD'): Promise<any> => {
    const response = await apiClient.get<StandardApiResponse<{ item: any }>>(
      `/api/academy/live-classes/public/${id}`,
      { params: mode ? { mode } : undefined },
    );
    const item = response.data.data!.item as any;

    if (item?.mode === 'LIVE') {
      const prices = academyClassCatalogApi.normalizePrice(item)
      return {
        ...item,
        courseProfile: item.cohort?.courseProfile ?? item.courseProfile,
        price: prices.price,
        discountPrice: prices.discountPrice,
        term: item.term ?? {
          openingDate: item.cohort?.startDate ?? item.cohort?.enrollmentOpenAt ?? null,
          name: item.cohort?.name,
          code: item.cohort?.code,
        },
        liveEnrollment: {
          maxStudents: item.maxStudents ?? null,
          activeEnrollmentCount: item._count?.enrollments ?? 0,
          isFull:
            item.maxStudents != null
              ? (item._count?.enrollments ?? 0) >= item.maxStudents
              : false,
        },
      };
    }

    const prices = academyClassCatalogApi.normalizePrice(item)
    return {
      ...item,
      mode: 'VOD',
      name: item.title ?? item.name,
      price: prices.price,
      discountPrice: prices.discountPrice,
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
 * Hook: sản phẩm học tập theo id (checkout)
 */
export function useAcademyProduct(id?: string, type: 'LIVE' | 'VOD' = 'LIVE') {
  return useQuery({
    queryKey: ['academy-course-products', 'id', id, type],
    queryFn: () => academyProductApi.getPublicById(id!, type),
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

export function useAcademyClassCatalog(params: {
  mode: 'LIVE' | 'VOD';
  level?: string;
  month?: string;
  q?: string;
}) {
  return useQuery({
    queryKey: ['academy-class-catalog', params],
    queryFn: () => academyClassCatalogApi.findPublic(params),
  });
}

export function useAcademyClassCatalogById(classId?: string, mode?: 'LIVE' | 'VOD') {
  return useQuery({
    queryKey: ['academy-class-catalog', 'id', classId, mode],
    queryFn: () => academyClassCatalogApi.getPublicById(classId!, mode),
    enabled: !!classId,
    retry: false,
  });
}
