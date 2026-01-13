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
    }
}
