import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type { StandardApiResponse } from '@workspace/schemas';

export const learningProgressApi = {
    async getMyCourses(): Promise<any[]> {
        const response = await apiClient.get<StandardApiResponse<any[]>>('/api/learning-progress/my-courses');
        return response.data.data!;
    },

    async trackProgress(lessonId: string, classId: string, status: string, progressPercent: number): Promise<any> {
        const response = await apiClient.post<StandardApiResponse<any>>('/api/learning-progress/track', {
            lessonId,
            classId,
            status,
            progressPercent,
            lastAccessedAt: new Date().toISOString()
        });
        return response.data.data!;
    },

    async getStats(): Promise<any> {
        const response = await apiClient.get<StandardApiResponse<any>>('/api/learning-progress/stats');
        return response.data.data!;
    },

    async getCompletedLessons(classId: string): Promise<any[]> {
        const response = await apiClient.get<StandardApiResponse<any[]>>(`/api/learning-progress/completed-lessons/\${classId}`);
        return response.data.data!;
    },

    async getHistory(): Promise<any[]> {
        const response = await apiClient.get<StandardApiResponse<any[]>>('/api/learning-progress/history');
        return response.data.data!;
    }
}

/**
 * Hook: Get completed lessons for a course
 */
export function useCompletedLessons(classId?: string) {
    return useQuery({
        queryKey: ['completed-lessons', classId],
        queryFn: () => learningProgressApi.getCompletedLessons(classId!),
        enabled: !!classId,
    });
}

export function useMyCourses() {
    return useQuery({
        queryKey: ['my-courses'],
        queryFn: learningProgressApi.getMyCourses,
    });
}

export function useLearningHistory() {
    return useQuery({
        queryKey: ['learning-history'],
        queryFn: learningProgressApi.getHistory,
    });
}

export function useLearningStats() {
    return useQuery({
        queryKey: ['learning-stats'],
        queryFn: learningProgressApi.getStats,
        staleTime: 5 * 60 * 1000,
    });
}
