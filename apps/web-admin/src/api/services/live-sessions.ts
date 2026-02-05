import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/api-client.ts';
import type {
    LiveSessionResponseDTO,
    LiveSessionCreateDTO,
    LiveSessionBulkCreateDTO,
    LiveSessionUpdateDTO,
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
    async findOne(id: string): Promise<LiveSessionResponseDTO> {
        const response = await apiClient.get<StandardApiResponse<LiveSessionResponseDTO>>(`/api/live-sessions/${id}`);
        return response.data.data!;
    },

    // GET /api/live-sessions/course/:courseId
    async findByCourse(courseId: string): Promise<LiveSessionResponseDTO[]> {
        const response = await apiClient.get<StandardApiResponse<LiveSessionResponseDTO[]>>(`/api/live-sessions/course/${courseId}`);
        return response.data.data!;
    },

    // POST /api/live-sessions
    async create(dto: LiveSessionCreateDTO): Promise<LiveSessionResponseDTO> {
        const response = await apiClient.post<StandardApiResponse<LiveSessionResponseDTO>>('/api/live-sessions', dto);
        return response.data.data!;
    },

    // POST /api/live-sessions/bulk
    async bulkCreate(dto: LiveSessionBulkCreateDTO): Promise<LiveSessionResponseDTO[]> {
        const response = await apiClient.post<StandardApiResponse<LiveSessionResponseDTO[]>>('/api/live-sessions/bulk', dto);
        return response.data.data!;
    },

    // PUT /api/live-sessions/:id
    async update(id: string, dto: LiveSessionUpdateDTO): Promise<LiveSessionResponseDTO> {
        const response = await apiClient.put<StandardApiResponse<LiveSessionResponseDTO>>(`/api/live-sessions/${id}`, dto);
        return response.data.data!;
    },

    // DELETE /api/live-sessions/:id
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

    // GET /api/teaching-schedules/course/:courseId
    async findSchedulesByCourse(courseId: string): Promise<TeachingScheduleResponseDTO[]> {
        const response = await apiClient.get<StandardApiResponse<TeachingScheduleResponseDTO[]>>(`/api/teaching-schedules/course/${courseId}`);
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
// React Query Hooks
// ============================================================================

export function useLiveSessions(courseId: string) {
    return useQuery({
        queryKey: ['live-sessions', 'course', courseId],
        queryFn: () => liveSessionsApi.findByCourse(courseId),
        enabled: !!courseId,
    });
}

export function useLiveSession(id: string) {
    return useQuery({
        queryKey: ['live-sessions', id],
        queryFn: () => liveSessionsApi.findOne(id),
        enabled: !!id,
    });
}

export function useCreateLiveSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: LiveSessionCreateDTO) => liveSessionsApi.create(dto),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['live-sessions', 'course', variables.courseId] });
        },
    });
}

export function useBulkCreateLiveSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (dto: LiveSessionBulkCreateDTO) => liveSessionsApi.bulkCreate(dto),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['live-sessions', 'course', variables.courseId] });
        },
    });
}

export function useUpdateLiveSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: LiveSessionUpdateDTO }) =>
            liveSessionsApi.update(id, dto),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['live-sessions', data.id] });
            queryClient.invalidateQueries({ queryKey: ['live-sessions', 'course', data.courseId] });
        },
    });
}

export function useDeleteLiveSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id }: { id: string; courseId: string }) => liveSessionsApi.delete(id),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['live-sessions', 'course', variables.courseId] });
        },
    });
}

export function useStartLiveSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => liveSessionsApi.start(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['live-sessions', data.id] });
            queryClient.invalidateQueries({ queryKey: ['live-sessions', 'course', data.courseId] });
        },
    });
}

export function useEndLiveSession() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => liveSessionsApi.end(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['live-sessions', data.id] });
            queryClient.invalidateQueries({ queryKey: ['live-sessions', 'course', data.courseId] });
        },
    });
}

// --- Teaching Schedule Hooks ---

export function useTeachingSchedules(courseId: string) {
    return useQuery({
        queryKey: ['teaching-schedules', 'course', courseId],
        queryFn: () => liveSessionsApi.findSchedulesByCourse(courseId),
        enabled: !!courseId,
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
            queryClient.invalidateQueries({ queryKey: ['teaching-schedules', 'course', variables.courseId] });
            queryClient.invalidateQueries({ queryKey: ['live-sessions', 'course', variables.courseId] });
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

export function usePendingScheduleRequests() {
    return useQuery({
        queryKey: ['teaching-schedules', 'requests', 'pending'],
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
