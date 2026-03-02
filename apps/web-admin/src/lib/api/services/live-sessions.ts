import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client.ts';
import type {
    LiveSessionResponseDTO,
    TeachingScheduleCreateDTO,
    TeachingScheduleResponseDTO,
    ScheduleRequestCreateDTO,
    ScheduleRequestResponseDTO,
    StandardApiResponse
} from '@workspace/schemas';

// ============================================================================
// API Functions
// ============================================================================

export const liveSessionsApi = {
    // GET /api/live-sessions/:id
    async findById(id: string): Promise<LiveSessionResponseDTO> {
        const response = await apiClient.get<StandardApiResponse<LiveSessionResponseDTO>>(`/api/live-sessions/${id}`);
        return response.data.data!;
    },

    // GET /api/live-sessions/run/:runId
    async findByRun(runId: string): Promise<LiveSessionResponseDTO[]> {
        const response = await apiClient.get<StandardApiResponse<LiveSessionResponseDTO[]>>(`/api/live-sessions/run/${runId}`);
        return response.data.data!;
    },

    // DELETE /api/live-sessions/:id - Only for emergency deletion
    async delete(id: string): Promise<boolean> {
        const response = await apiClient.delete<StandardApiResponse<boolean>>(`/api/live-sessions/${id}`);
        return response.data.success;
    },

    // POST /api/live-sessions/:id/start
    async start(id: string): Promise<LiveSessionResponseDTO> {
        const response = await apiClient.post<StandardApiResponse<LiveSessionResponseDTO>>(`/api/live-sessions/${id}/start`);
        return response.data.data!;
    },

    // POST /api/live-sessions/:id/end
    async end(id: string): Promise<LiveSessionResponseDTO> {
        const response = await apiClient.post<StandardApiResponse<LiveSessionResponseDTO>>(`/api/live-sessions/${id}/end`);
        return response.data.data!;
    },

    // POST /api/live-sessions/:id/join
    async join(id: string): Promise<{ token: string; roomId: string; roomTitle: string; sid: string }> {
        const response = await apiClient.post<StandardApiResponse<{ token: string; roomId: string; roomTitle: string; sid: string }>>(`/api/live-sessions/${id}/join`);
        return response.data.data!;
    },

    // PATCH /api/live-sessions/:id
    async update(id: string, dto: any): Promise<LiveSessionResponseDTO> {
        const response = await apiClient.patch<StandardApiResponse<LiveSessionResponseDTO>>(`/api/live-sessions/${id}`, dto);
        return response.data.data!;
    },

    // POST /api/live-sessions
    async create(dto: any): Promise<LiveSessionResponseDTO> {
        const response = await apiClient.post<StandardApiResponse<LiveSessionResponseDTO>>('/api/live-sessions', dto);
        return response.data.data!;
    },

    // --- Teaching Schedule API ---

    // GET /api/teaching-schedules/check-availability
    async checkAvailability(params: { lecturerId: string; dayOfWeek: number; startTime: string; duration: number; excludeScheduleId?: string }): Promise<{ available: boolean; conflicts?: any[] }> {
        const response = await apiClient.get<StandardApiResponse<{ available: boolean; conflicts?: any[] }>>('/api/teaching-schedules/check-availability', { params });
        return response.data.data!;
    },

    // POST /api/teaching-schedules
    async assignSchedule(dto: TeachingScheduleCreateDTO): Promise<TeachingScheduleResponseDTO> {
        const response = await apiClient.post<StandardApiResponse<TeachingScheduleResponseDTO>>('/api/teaching-schedules', dto);
        return response.data.data!;
    },

    // GET /api/teaching-schedules/run/:runId
    async findSchedulesByRun(runId: string): Promise<TeachingScheduleResponseDTO[]> {
        const response = await apiClient.get<StandardApiResponse<TeachingScheduleResponseDTO[]>>(`/api/teaching-schedules/run/${runId}`);
        return response.data.data!;
    },

    // DELETE /api/teaching-schedules/:id
    async removeSchedule(id: string): Promise<boolean> {
        const response = await apiClient.delete<StandardApiResponse<boolean>>(`/api/teaching-schedules/${id}`);
        return response.data.success;
    },

    // GET /api/teaching-schedules/requests/pending
    async getPendingScheduleRequests(): Promise<ScheduleRequestResponseDTO[]> {
        const response = await apiClient.get<StandardApiResponse<ScheduleRequestResponseDTO[]>>('/api/teaching-schedules/requests/pending');
        return response.data.data!;
    },

    // POST /api/teaching-schedules/requests/:id/handle
    async handleScheduleRequest(id: string, action: 'approve' | 'reject'): Promise<void> {
        await apiClient.post(`/api/teaching-schedules/requests/${id}/handle`, { action });
    },

    // POST /api/teaching-schedules/requests
    async createScheduleRequest(dto: ScheduleRequestCreateDTO): Promise<ScheduleRequestResponseDTO> {
        const response = await apiClient.post<StandardApiResponse<ScheduleRequestResponseDTO>>('/api/teaching-schedules/requests', dto);
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

export function useLiveSession(id: string) {
    return useQuery({
        queryKey: ['live-sessions', id],
        queryFn: () => liveSessionsApi.findById(id),
        enabled: !!id,
    });
}

export function useCreateLiveSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: any) => liveSessionsApi.create(dto),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['live-sessions', 'run', data.courseRunId] });
        },
    });
}

export function useDeleteLiveSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id }: { id: string; courseRunId: string }) => liveSessionsApi.delete(id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['live-sessions', 'run', variables.courseRunId] });
        },
    });
}

export function useStartLiveSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => liveSessionsApi.start(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['live-sessions', data.id] });
            queryClient.invalidateQueries({ queryKey: ['live-sessions', 'run', data.courseRunId] });
        },
    });
}

export function useEndLiveSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => liveSessionsApi.end(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['live-sessions', data.id] });
            queryClient.invalidateQueries({ queryKey: ['live-sessions', 'run', data.courseRunId] });
        },
    });
}

export function useUpdateLiveSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: any }) => liveSessionsApi.update(id, dto),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['live-sessions', data.id] });
            queryClient.invalidateQueries({ queryKey: ['live-sessions', 'run', data.courseRunId] });
        },
    });
}

// ============================================================================
// React Query Hooks - Teaching Schedules
// ============================================================================

export function useTeachingSchedules(runId: string) {
    return useQuery({
        queryKey: ['teaching-schedules', 'run', runId],
        queryFn: () => liveSessionsApi.findSchedulesByRun(runId),
        enabled: !!runId,
    });
}

export function useCheckAvailability() {
    return useMutation({
        mutationFn: (params: { lecturerId: string; dayOfWeek: number; startTime: string; duration: number; excludeScheduleId?: string }) =>
            liveSessionsApi.checkAvailability(params),
    });
}

export function useCheckAvailabilityQuery(params: { lecturerId: string; dayOfWeek: number; startTime: string; duration: number; excludeScheduleId?: string }, enabled = true) {
    return useQuery({
        queryKey: ['teaching-schedules', 'availability', params],
        queryFn: () => liveSessionsApi.checkAvailability(params),
        enabled: enabled && !!params.lecturerId && !!params.startTime,
    });
}

export function useAssignTeachingSchedule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: TeachingScheduleCreateDTO) => liveSessionsApi.assignSchedule(dto),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['teaching-schedules', 'run', variables.courseRunId] });
            queryClient.invalidateQueries({ queryKey: ['live-sessions', 'run', variables.courseRunId] });
        },
    });
}

export function useRemoveTeachingSchedule() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => liveSessionsApi.removeSchedule(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teaching-schedules'] });
            queryClient.invalidateQueries({ queryKey: ['live-sessions'] });
        },
    });
}

// ============================================================================
// React Query Hooks - Schedule Requests
// ============================================================================

export function usePendingScheduleRequests() {
    return useQuery({
        queryKey: ['schedule-requests', 'pending'],
        queryFn: () => liveSessionsApi.getPendingScheduleRequests(),
    });
}

export function useHandleScheduleRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, action }: { id: string; action: 'approve' | 'reject' }) =>
            liveSessionsApi.handleScheduleRequest(id, action),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teaching-schedules'] });
            queryClient.invalidateQueries({ queryKey: ['live-sessions'] });
        },
    });
}

export function useCreateScheduleRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: ScheduleRequestCreateDTO) => liveSessionsApi.createScheduleRequest(dto),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teaching-schedules', 'requests', 'pending'] });
        },
    });
}
