import { apiClient } from '../api-client';
import type {
    LiveSessionResponseDTO,
    LiveSessionJoinResponseDTO,
    StandardApiResponse
} from '@workspace/schemas';

export const liveSessionApi = {
    // GET /api/live-sessions/course/:courseId/active
    async getActiveSession(courseId: string): Promise<LiveSessionResponseDTO | null> {
        try {
            const response = await apiClient.get<StandardApiResponse<LiveSessionResponseDTO>>(`/api/live-sessions/course/${courseId}/active`);
            return response.data.data ?? null;
        } catch (error) {
            console.error('Error fetching active live session:', error);
            return null;
        }
    },

    // GET /api/live-sessions/course/:courseId
    async getSessions(courseId: string): Promise<LiveSessionResponseDTO[]> {
        const response = await apiClient.get<StandardApiResponse<LiveSessionResponseDTO[]>>(`/api/live-sessions/course/${courseId}`);
        return response.data.data ?? [];
    },

    // POST /api/live-sessions/:id/join
    async joinSession(id: string): Promise<LiveSessionJoinResponseDTO> {
        const response = await apiClient.post<StandardApiResponse<LiveSessionJoinResponseDTO>>(`/api/live-sessions/${id}/join`);
        return response.data.data!;
    }
};

// React Query hooks can be added if needed, but for now we'll use direct calls or custom hooks in components
