import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type { StandardApiResponse } from '@workspace/schemas';

export interface MyCourseResponse {
    id: string;
    slug: string;
    title: string;
    thumbnailUrl: string | null;
    type?: 'vod' | 'live';
    instructor: string;
    progress: number;
    totalLessons: number;
    completedLessons: number;
    lastAccessed: string | null;
    expiresAt: string | null;
    status: string;
}

export interface LearningStats {
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    totalLearningHours: number;
    averageProgress: number;
    currentStreak: number; // Placeholder
}

export interface HistoryItem {
    id: string;
    courseTitle: string;
    lessonTitle: string;
    timestamp: string;
    duration: number;
    slug: string;
    lessonId: string;
    courseMasterId: string;
    expiresAt: string | null;
}

export const learningProgressApi = {
    async getMyCourses(): Promise<MyCourseResponse[]> {
        const response = await apiClient.get<StandardApiResponse<{ courses: MyCourseResponse[] }>>('/api/learning-progress/my-courses');
        return response.data.data!.courses;
    },

    async trackProgress(lessonId: string, seconds: number, totalSeconds: number): Promise<{ success: boolean }> {
        const response = await apiClient.post<StandardApiResponse<{ success: boolean }>>('/api/learning-progress/track', {
            lessonId,
            seconds,
            totalSeconds,
        });
        return response.data.data!;
    },

    async getStats(): Promise<LearningStats> {
        const response = await apiClient.get<StandardApiResponse<{ stats: LearningStats }>>('/api/learning-progress/stats');
        return response.data.data!.stats;
    },

    async getCompletedLessons(courseId: string): Promise<string[]> {
        const response = await apiClient.get<StandardApiResponse<{ lessonIds: string[] }>>(`/api/learning-progress/completed-lessons/${courseId}`);
        return response.data.data!.lessonIds;
    },

    async getHistory(): Promise<HistoryItem[]> {
        const response = await apiClient.get<StandardApiResponse<{ history: HistoryItem[] }>>('/api/learning-progress/history');
        return response.data.data!.history;
    }
}

/**
 * Hook: Get completed lessons for a course
 */
export function useCompletedLessons(courseId?: string) {
    return useQuery({
        queryKey: ['completed-lessons', courseId],
        queryFn: () => learningProgressApi.getCompletedLessons(courseId!),
        enabled: !!courseId,
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
        staleTime: 5 * 60 * 1000, // 5 min — stats update on lesson completion
    });
}
