import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type {
    LiveSessionResponseDTO,
    LiveSessionJoinResponseDTO,
    StandardApiResponse
} from '@workspace/schemas';
import { learningProgressApi } from './learning-progress-api';

export const liveSessionApi = {
    // GET /api/live-sessions/run/:courseRunId/active
    async getActiveSession(courseRunId: string): Promise<LiveSessionResponseDTO | null> {
        try {
            const response = await apiClient.get<StandardApiResponse<LiveSessionResponseDTO>>(`/api/live-sessions/run/${courseRunId}/active`);
            return response.data.data ?? null;
        } catch (error) {
            console.error('Error fetching active live session:', error);
            return null;
        }
    },

    // GET /api/live-sessions/run/:courseRunId
    async getSessions(courseRunId: string): Promise<LiveSessionResponseDTO[]> {
        const response = await apiClient.get<StandardApiResponse<LiveSessionResponseDTO[]>>(`/api/live-sessions/run/${courseRunId}`);
        return response.data.data ?? [];
    },

    // POST /api/live-sessions/:id/join
    async joinSession(id: string): Promise<LiveSessionJoinResponseDTO> {
        const response = await apiClient.post<StandardApiResponse<LiveSessionJoinResponseDTO>>(`/api/live-sessions/${id}/join`);
        return response.data.data!;
    },

    // Aggregate sessions from all enrolled live courses
    async getMySchedule(): Promise<(LiveSessionResponseDTO & { courseTitle: string; courseThumbnail: string | null })[]> {
        const courses = await learningProgressApi.getMyCourses();
        const liveCourses = courses.filter(c => c.type === 'live');

        if (liveCourses.length === 0) return [];

        const sessionArrays = await Promise.allSettled(
            liveCourses.map(course =>
                liveSessionApi.getSessions(course.courseRunId).then(sessions =>
                    sessions.map(s => ({
                        ...s,
                        courseTitle: course.title,
                        courseThumbnail: course.thumbnailUrl,
                    }))
                )
            )
        );

        return sessionArrays
            .filter((r): r is PromiseFulfilledResult<any[]> => r.status === 'fulfilled')
            .flatMap(r => r.value)
            .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    }
};

export function useMySchedule() {
    return useQuery({
        queryKey: ['my-schedule'],
        queryFn: liveSessionApi.getMySchedule,
        staleTime: 5 * 60 * 1000, // 5 mins
    });
}
