import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type {
    AcademyLessonModel,
    StandardApiResponse
} from '@workspace/schemas';

export const academyLessonApi = {
    /**
     * Get lesson details by ID
     */
    async findById(lessonId: string): Promise<AcademyLessonModel> {
        const response = await apiClient.get<StandardApiResponse<{ item: AcademyLessonModel }>>(`/api/academy/lessons/${lessonId}`);
        return response.data.data!.item;
    },
};

/**
 * Hook: Get single academy lesson detail
 */
export function useAcademyLesson(lessonId: string) {
    return useQuery({
        queryKey: ['academy-lessons', lessonId],
        queryFn: () => academyLessonApi.findById(lessonId),
        enabled: !!lessonId,
    });
}
