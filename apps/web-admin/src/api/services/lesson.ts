import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/api-client.ts';
import type { PaginatedResponse, LessonResponseDTO, LessonCreateDTO, LessonUpdateDTO, LessonQueryDTO } from '@workspace/schemas';

// ============================================================================
// API Functions
// ============================================================================

export const lessonsApi = {
    // GET /api/admin/lessons
    async findAll(params: LessonQueryDTO): Promise<PaginatedResponse<LessonResponseDTO>> {
        const response = await apiClient.get<PaginatedResponse<LessonResponseDTO>>('/api/lessons', { params });
        return response.data;
    },

    // GET /api/admin/lessons/:id
    async findOne(id: string): Promise<LessonResponseDTO> {
        const response = await apiClient.get<LessonResponseDTO>(`/api/lessons/${id}`);
        return response.data;
    },

    // POST /api/admin/lessons
    async create(lesson: LessonCreateDTO): Promise<LessonResponseDTO> {
        const response = await apiClient.post<LessonResponseDTO>('/api/lessons', lesson);
        return response.data;
    },

    // PATCH /api/admin/lessons/:id
    async update(id: string, lesson: LessonUpdateDTO): Promise<LessonResponseDTO> {
        const response = await apiClient.patch<LessonResponseDTO>(`/api/lessons/${id}`, lesson);
        return response.data;
    },

    // DELETE /api/admin/lessons/:id
    async delete(id: string): Promise<boolean> {
        const response = await apiClient.delete(`/api/lessons/${id}`);
        return response.data;
    },

    // PATCH /api/admin/lessons/:id/restore
    async restore(id: string): Promise<LessonResponseDTO> {
        const response = await apiClient.patch<LessonResponseDTO>(`/api/lessons/${id}/restore`);
        return response.data;
    },
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook: Get lessons list with pagination and filters
 */
export function useLessons(params: LessonQueryDTO) {
    return useQuery({
        queryKey: ['lessons', params],
        queryFn: () => lessonsApi.findAll(params),
        staleTime: 30000,
    });
}

/**
 * Hook: Get single lesson by ID
 */
export function useLesson(id: string) {
    return useQuery({
        queryKey: ['lessons', id],
        queryFn: () => lessonsApi.findOne(id),
        enabled: !!id,
    });
}

/**
 * Hook: Create new lesson
 */
export function useCreateLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (lesson: LessonCreateDTO) => lessonsApi.create(lesson),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lessons'] });
        },
    });
}

/**
 * Hook: Update lesson
 */
export function useUpdateLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, lesson }: { id: string; lesson: LessonUpdateDTO }) =>
            lessonsApi.update(id, lesson),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lessons', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['lessons'] });
        },
    });
}

/**
 * Hook: Delete lesson
 */
export function useDeleteLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => lessonsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lessons'] });
        },
    });
}

/**
 * Hook: Restore lesson
 */
export function useRestoreLesson() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => lessonsApi.restore(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lessons'] });
        },
    });
}
