import { apiClient } from '../api-client';

export interface LessonResponse {
    id: string;
    moduleId: string;
    title: string;
    contentType: 'video' | 'article' | 'quiz';
    videoUrl?: string;
    videoDuration?: number;
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
