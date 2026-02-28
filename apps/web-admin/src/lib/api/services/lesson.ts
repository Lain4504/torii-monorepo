import { useQuery, useMutation, useQueryClient, useQueries } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client.ts';
import type {
    LessonResponseDTO,
    LessonCreateDTO,
    LessonUpdateDTO,
    LessonQueryDTO,
    StandardApiResponse,
    PaginatedApiResponse,
} from '@workspace/schemas';

// ============================================================================
// API Functions
// ============================================================================

export const lessonsApi = {
    // POST /api/lessons/search
    async search(params: LessonQueryDTO): Promise<PaginatedApiResponse<LessonResponseDTO>> {
        const response = await apiClient.post<PaginatedApiResponse<LessonResponseDTO>>('/api/lessons/search', params);
        return response.data;
    },

    // GET /api/lessons/by-module/:moduleId
    async findByModuleId(moduleId: string): Promise<LessonResponseDTO[]> {
        const response = await apiClient.get<StandardApiResponse<{ lessons: LessonResponseDTO[] }>>(`/api/lessons/by-module/${moduleId}`);
        return response.data.data!.lessons;
    },

    // GET /api/admin/lessons/:id
    async findById(id: string): Promise<LessonResponseDTO> {
        const response = await apiClient.get<StandardApiResponse<{ lesson: LessonResponseDTO }>>(`/api/lessons/${id}`);
        return response.data.data!.lesson;
    },

    // POST /api/admin/lessons
    async create(lesson: LessonCreateDTO): Promise<LessonResponseDTO> {
        const response = await apiClient.post<StandardApiResponse<{ lesson: LessonResponseDTO }>>('/api/lessons', lesson);
        return response.data.data!.lesson;
    },

    // PATCH /api/admin/lessons/:id
    async update(id: string, lesson: LessonUpdateDTO): Promise<LessonResponseDTO> {
        const response = await apiClient.patch<StandardApiResponse<{ lesson: LessonResponseDTO }>>(`/api/lessons/${id}`, lesson);
        return response.data.data!.lesson;
    },

    // DELETE /api/admin/lessons/:id
    async delete(id: string): Promise<boolean> {
        const response = await apiClient.delete<StandardApiResponse<boolean>>(`/api/lessons/${id}`);
        return response.data.success;
    },

    // PATCH /api/admin/lessons/:id/restore
    async restore(id: string): Promise<LessonResponseDTO> {
        const response = await apiClient.patch<StandardApiResponse<{ lesson: LessonResponseDTO }>>(`/api/lessons/${id}/restore`);
        return response.data.data!.lesson;
    },

    // POST /api/lessons/reorder/:moduleId
    async reorder(moduleId: string, lessonOrders: { id: string; orderIndex: number }[]): Promise<boolean> {
        const response = await apiClient.post<StandardApiResponse<{ lessons: LessonResponseDTO[] }>>(`/api/lessons/reorder/${moduleId}`, lessonOrders);
        return response.data.success;
    },
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook: Reorder lessons
 */
export function useReorderLessons() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ moduleId, lessonOrders }: { moduleId: string; lessonOrders: { id: string; orderIndex: number }[] }) =>
            lessonsApi.reorder(moduleId, lessonOrders),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['lessons', 'module', variables.moduleId] });
        },
    });
}

/**
 * Hook: Get lessons list with pagination and filters
 */
export function useLessons(params: LessonQueryDTO) {
    return useQuery({
        queryKey: ['lessons', params.moduleId || 'all', params],
        queryFn: () => lessonsApi.search(params),
        staleTime: 30000,
    });
}

/**
 * Hook: Get single lesson by ID
 */
export function useLesson(id: string) {
    return useQuery({
        queryKey: ['lessons', id],
        queryFn: () => lessonsApi.findById(id),
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
/**
 * Hook: Fetch lessons for multiple modules in parallel
 * Used in Course Detail Page to load curriculum
 */
export function useModulesLessons(modules: { id: string }[]) {
    return useQueries({
        queries: modules.map((module) => ({
            queryKey: ['lessons', 'module', module.id],
            queryFn: async () => {
                const lessons = await lessonsApi.findByModuleId(module.id);
                // Wrap in standard response format for compatibility with existing UI
                return { success: true, data: lessons, message: '' };
            },
            staleTime: 1000 * 60 * 5, // 5 minutes
            enabled: !!module.id,
        })),
    });
}
