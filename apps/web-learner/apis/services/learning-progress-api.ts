import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';

export interface MyCourseResponse {
    id: string;
    slug: string;
    title: string;
    thumbnailUrl: string | null;
    instructor: string;
    progress: number;
    totalLessons: number;
    completedLessons: number;
    lastAccessed: string | null;
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
    courseId: string;
}

export const learningProgressApi = {
    async getMyCourses(): Promise<MyCourseResponse[]> {
        const response = await apiClient.get<MyCourseResponse[]>('/api/learning-progress/my-courses');
        return response.data;
    },

    async trackProgress(lessonId: string, seconds: number, totalSeconds: number): Promise<{ success: boolean }> {
        const response = await apiClient.post<{ success: boolean }>('/api/learning-progress/track', {
            lessonId,
            seconds,
            totalSeconds,
        });
        return response.data;
    },

    async getStats(): Promise<LearningStats> {
        const response = await apiClient.get<LearningStats>('/api/learning-progress/stats');
        return response.data;
    },

    async getCompletedLessons(courseId: string): Promise<string[]> {
        const response = await apiClient.get<string[]>(`/api/learning-progress/completed-lessons/${courseId}`);
        return response.data;
    },

    async getHistory(): Promise<HistoryItem[]> {
        const response = await apiClient.get<HistoryItem[]>('/api/learning-progress/history');
        return response.data;
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
