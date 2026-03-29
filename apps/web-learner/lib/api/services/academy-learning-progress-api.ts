import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type {
    StandardApiResponse,
    AcademyEnrollmentModel
} from '@workspace/schemas';
import { academyEnrollmentApi } from './academy-enrollment-api';

export const academyLearningProgressApi = {
    /**
     * Get current user's enrolled courses with progress
     * Re-routed to enrollments/me which now includes progress data in V2
     */
    getMyCourses: async (): Promise<AcademyEnrollmentModel[]> => {
        const response = await academyEnrollmentApi.getMyEnrollments({ page: 1, limit: 100, status: 'ACTIVE' });
        return response.data ?? [];
    },

    /**
     * Track progress for a specific lesson
     * Maps to new class lesson completion endpoint
     */
    trackProgress: async (payload: { lessonId: string; classId: string }): Promise<any> => {
        const response = await apiClient.post<StandardApiResponse<any>>(
            `/api/academy/live-classes/${payload.classId}/lessons/${payload.lessonId}/complete`
        );
        return response.data.data!;
    },

    /**
     * Get learning statistics for current user
     */
    getStats: async (): Promise<any> => {
        const response = await apiClient.get<StandardApiResponse<any>>('/api/academy/enrollments/stats');
        return response.data.data!;
    },

    /**
     * Get progress detail for a specific class
     */
    getClassProgress: async (classId: string): Promise<string[]> => {
        try {
            const response = await apiClient.get<StandardApiResponse<string[]>>(`/api/academy/live-classes/${classId}/completed-lessons`);
            return response.data.data!;
        } catch {
            return [];
        }
    },

    /**
     * Get IDs of completed content items for a specific class.
     * Backend `getUserProgress` trả `{ modules: [{ lessons: [{ id, isCompleted, ... }] }] }` — không có `lessons` phẳng.
     */
    getCompletedLessonIds: async (classId: string): Promise<string[]> => {
        return academyLearningProgressApi.getClassProgress(classId);
    },

    /**
     * Get user's learning history
     */
    getHistory: async (): Promise<any[]> => {
        // Redirection to gamification history as a fallback or if unified
        const response = await apiClient.get<StandardApiResponse<any>>('/api/gamification/history');
        return (response.data.data?.items ?? []).map((it: any) => ({
            id: it.id,
            userId: it.userId,
            classId: it.metadata?.classId,
            lessonId: it.metadata?.lessonId,
            lessonTitle: it.description,
            courseTitle: it.metadata?.courseTitle ?? 'Khóa học',
            progressPercent: 100,
            timestamp: it.createdAt,
        }));
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
