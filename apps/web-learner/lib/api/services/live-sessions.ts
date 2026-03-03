import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client';
import type {
    LiveSessionResponseDTO,
    StandardApiResponse
} from '@workspace/schemas';

// ============================================================================
// API Functions
// ============================================================================

export const liveSessionsApi = {
    // GET /api/live-sessions/run/:runId
    async findByRun(runId: string): Promise<LiveSessionResponseDTO[]> {
        const response = await apiClient.get<StandardApiResponse<LiveSessionResponseDTO[]>>(`/api/live-sessions/run/${runId}`);
        return response.data.data!;
    },

    // POST /api/live-sessions/:id/join
    async join(id: string): Promise<{ token: string; roomId: string; roomTitle: string; sid: string }> {
        const response = await apiClient.post<StandardApiResponse<{ token: string; roomId: string; roomTitle: string; sid: string }>>(`/api/live-sessions/${id}/join`);
        return response.data.data!;
    },
};

// ============================================================================
// React Query Hooks - Live Sessions
// ============================================================================

export function useLiveSessions(runId: string) {
    return useQuery({
        queryKey: ['live-sessions', 'run', runId],
        queryFn: () => liveSessionsApi.findByRun(runId),
        enabled: !!runId,
    });
}
