import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type {
  AcademyClassModel,
  AcademyClassQueryDTO,
  StandardApiResponse,
  PaginatedApiResponse
} from '@workspace/schemas';

export interface CurriculumLesson {
  id: string; // This is the ChapterItemId
  title: string;
  contentType: 'video' | 'article' | 'assignment' | 'quiz' | string;
  isUnlocked: boolean;
  isPreview: boolean;
  order: number;
  referenceId: string; // The ID of the actual Lesson (video/article), AssignmentTemplate, or QuizTemplate
}

export interface CurriculumModule {
  id: string; // Chapter ID
  title: string;
  order: number;
  lessons: CurriculumLesson[];
}

export const academyClassesApi = {
  /**
   * Get all classes with pagination and filters
   */
  findAll: async (params: AcademyClassQueryDTO): Promise<PaginatedApiResponse<AcademyClassModel>> => {
    const response = await apiClient.get<StandardApiResponse<{ items: AcademyClassModel[]; total: number; page: number; limit: number; totalPages: number }>>(
      '/api/academy/classes',
      { params }
    );
    const data = response.data.data!;
    return {
      success: response.data.success,
      data: data.items,
      total: data.total,
      page: data.page,
      limit: data.limit,
      totalPages: data.totalPages,
    };
  },

  /**
   * Get class by ID
   */
  findById: async (id: string): Promise<AcademyClassModel> => {
    const response = await apiClient.get<StandardApiResponse<{ item: AcademyClassModel }>>(
      `/api/academy/classes/\${id}`,
    );
    return response.data.data!.item;
  },

  /**
   * Get curriculum for a class
   */
  getCurriculum: async (id: string): Promise<any> => {
    const response = await apiClient.get<StandardApiResponse<{ curriculum: any }>>(
      `/api/academy/classes/\${id}/curriculum`
    );
    const data = response.data.data?.curriculum;
    if (!data) return null;

    // Map academy structure (chapters) to UI structure (modules for legacy compatibility if needed)
    // or just return as is if the UI is updated. 
    // Keeping mapping for now if UI expects 'modules'
    return {
      courseId: data.classId,
      modules: data.chapters.map((ch: any) => ({
        id: ch.id,
        title: ch.title,
        order: ch.orderIndex,
        lessons: ch.items.map((it: any) => ({
          id: it.id,
          title: it.title,
          contentType: it.kind.toLowerCase() === 'lesson' ? 'video' : it.kind.toLowerCase(),
          isUnlocked: true,
          isPreview: false,
          order: it.orderIndex,
          referenceId: it.referenceId,
        })),
      })),
    };
  },
};

/**
 * Hook: Get all classes with filters
 */
export function useAcademyClasses(params: AcademyClassQueryDTO) {
  return useQuery({
    queryKey: ['academy-classes', params],
    queryFn: () => academyClassesApi.findAll(params),
  });
}

/**
 * Hook: Get academy class by ID
 */
export function useAcademyClass(id?: string) {
  return useQuery({
    queryKey: ['academy-classes', 'id', id],
    queryFn: () => academyClassesApi.findById(id!),
    enabled: !!id,
  });
}

/**
 * Hook: Get curriculum for a class
 */
export function useCurriculum(classId?: string) {
  return useQuery({
    queryKey: ['curriculum', classId],
    queryFn: () => academyClassesApi.getCurriculum(classId!),
    enabled: !!classId,
  });
}
