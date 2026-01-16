import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';

export interface LessonResponse {
    id: string;
    moduleId: string;
    title: string;
    contentType: 'video' | 'article' | 'quiz' | 'assignment';
    videoUrl?: string;
    videoDuration?: number;
    description?: string;
    articleContent?: string;
    orderIndex: number;
    isPreview: boolean;
    isUnlocked: boolean;
    createdAt: string;
    updatedAt: string;
}

export const lessonApi = {
    /**
     * Get lesson details by ID
     */
    getLesson: async (lessonId: string): Promise<LessonResponse> => {
        const response = await apiClient.get<LessonResponse>(`/api/lessons/${lessonId}`);
        return response.data;
    },
};

/**
 * Hook: Get single lesson detail
 */
export function useLesson(lessonId: string) {
    return useQuery({
        queryKey: ['lessons', lessonId],
        queryFn: () => lessonApi.getLesson(lessonId),
        enabled: !!lessonId,
    });
}
