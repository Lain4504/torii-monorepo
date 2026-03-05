import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type { StandardApiResponse } from '@workspace/schemas';

export interface MyCourseResponse {
    id: string;
    courseRunId: string;
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
        });
        return response.data.data!;
    },

    async getStats(): Promise<any> {
        const response = await apiClient.get<StandardApiResponse<any>>('/api/learning-progress/stats');
        return response.data.data!;
    },

    async getCompletedLessons(classId: string): Promise<any[]> {
        const response = await apiClient.get<StandardApiResponse<any[]>>(`/api/learning-progress/completed-lessons/${classId}`);
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
