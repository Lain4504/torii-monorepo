import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/api-client.ts';
import type {
    LiveSessionResponseDTO,
    LiveSessionCreateDTO,
    LiveSessionUpdateDTO,
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
