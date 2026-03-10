import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type {
    StandardApiResponse,
    AcademyLearningStats,
    AcademyLearningProgressModel,
    AcademyEnrollmentModel
} from '@workspace/schemas';

export const academyLearningProgressApi = {
    /**
     * Get current user's enrolled courses with progress
     */
    getMyCourses: async (): Promise<AcademyEnrollmentModel[]> => {
        const response = await apiClient.get<StandardApiResponse<AcademyEnrollmentModel[]>>('/api/learning-progress/my-courses');
        return response.data.data!;
    },

    /**
     * Track progress for a specific content item
     * (contentItemId = class_content_items.id)
     */
    trackProgress: async (payload: { contentItemId: string; classId: string; status: string; progressPercent: number }): Promise<any> => {
        const response = await apiClient.post<StandardApiResponse<any>>('/api/learning-progress/track', payload);
        return response.data.data!;
    },

    /**
     * Get learning statistics for the current user
     */
    getStats: async (): Promise<AcademyLearningStats> => {
        const response = await apiClient.get<StandardApiResponse<AcademyLearningStats>>('/api/learning-progress/stats');
        return response.data.data!;
    },

    /**
     * Get IDs of completed content items for a specific class
     * (IDs are class_content_items.id)
     */
    getCompletedLessonIds: async (classId: string): Promise<string[]> => {
        const response = await apiClient.get<StandardApiResponse<string[]>>(`/api/learning-progress/completed-lessons/${classId}`);
        return response.data.data!;
    },

    /**
     * Get user's learning history
     */
    getHistory: async (): Promise<AcademyLearningProgressModel[]> => {
        const response = await apiClient.get<StandardApiResponse<AcademyLearningProgressModel[]>>('/api/learning-progress/history');
        return response.data.data!;
    }
}

/**
 * Hook: Get my enrolled courses
 */
export function useAcademyMyCourses() {
    return useQuery({
        queryKey: ['academy-learning', 'my-courses'],
        queryFn: academyLearningProgressApi.getMyCourses,
    });
}

/**
 * Hook: Get learning statistics
 */
export function useAcademyLearningStats() {
    return useQuery({
        queryKey: ['academy-learning', 'stats'],
        queryFn: academyLearningProgressApi.getStats,
        staleTime: 5 * 60 * 1000,
    });
}

/**
 * Hook: Get completed lesson IDs for a class
 */
export function useAcademyCompletedLessonIds(classId?: string) {
    return useQuery({
        queryKey: ['academy-learning', 'completed-lessons', classId],
        queryFn: () => academyLearningProgressApi.getCompletedLessonIds(classId!),
        enabled: !!classId,
    });
}

/**
 * Hook: Get learning history
 */
export function useAcademyLearningHistory() {
    return useQuery({
        queryKey: ['academy-learning', 'history'],
        queryFn: academyLearningProgressApi.getHistory,
    });
}
