import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/api-client.ts';
import type { PaginatedResponseDTO, CourseResponseDTO, CourseCreateDTO, CourseUpdateDTO, CourseQueryDTO } from '@workspace/schemas';

// ============================================================================
// API Functions
// ============================================================================

export const coursesApi = {
    // GET /api/admin/courses
    async findAll(params: CourseQueryDTO): Promise<PaginatedResponseDTO<CourseResponseDTO>> {
        const response = await apiClient.get<PaginatedResponseDTO<CourseResponseDTO>>('/api/courses', { params });
        return response.data;
    },

    // GET /api/admin/courses/:id
    async findOne(id: string): Promise<CourseResponseDTO> {
        const response = await apiClient.get<CourseResponseDTO>(`/api/courses/${id}`);
        return response.data;
    },

    // POST /api/admin/courses
    async create(course: CourseCreateDTO): Promise<CourseResponseDTO> {
        const response = await apiClient.post<CourseResponseDTO>('/api/courses', course);
        return response.data;
    },

    // PATCH /api/admin/courses/:id
    async update(id: string, course: CourseUpdateDTO): Promise<CourseResponseDTO> {
        const response = await apiClient.patch<CourseResponseDTO>(`/api/courses/${id}`, course);
        return response.data;
    },

    // DELETE /api/admin/courses/:id
    async delete(id: string): Promise<boolean> {
        const response = await apiClient.delete(`/api/courses/${id}`);
        return response.data;
    },

    // PATCH /api/admin/courses/:id/restore
    async restore(id: string): Promise<CourseResponseDTO> {
        const response = await apiClient.patch<CourseResponseDTO>(`/api/courses/${id}/restore`);
        return response.data;
    },

    // POST /api/courses/:id/publish
    async publish(id: string): Promise<CourseResponseDTO> {
        const response = await apiClient.post<CourseResponseDTO>(`/api/courses/${id}/publish`);
        return response.data;
    },

    // POST /api/courses/:id/unpublish
    async unpublish(id: string): Promise<CourseResponseDTO> {
        const response = await apiClient.post<CourseResponseDTO>(`/api/courses/${id}/unpublish`);
        return response.data;
    },
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook: Get courses list with pagination and filters
 */
export function useCourses(params: CourseQueryDTO) {
    return useQuery({
        queryKey: ['courses', params],
        queryFn: () => coursesApi.findAll(params),
        staleTime: 30000,
    });
}

/**
 * Hook: Get single course by ID
 */
export function useCourse(id: string) {
    return useQuery({
        queryKey: ['courses', id],
        queryFn: () => coursesApi.findOne(id),
        enabled: !!id,
    });
}

/**
 * Hook: Create new course
 */
export function useCreateCourse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (course: CourseCreateDTO) => coursesApi.create(course),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
        },
    });
}

/**
 * Hook: Update course
 */
export function useUpdateCourse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, course }: { id: string; course: CourseUpdateDTO }) =>
            coursesApi.update(id, course),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['courses', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['courses'] });
        },
    });
}

/**
 * Hook: Delete course
 */
export function useDeleteCourse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => coursesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
        },
    });
}

/**
 * Hook: Restore course
 */
export function useRestoreCourse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => coursesApi.restore(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
        },
    });
}

/**
 * Hook: Publish course
 */
export function usePublishCourse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => coursesApi.publish(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['courses', id] });
            queryClient.invalidateQueries({ queryKey: ['courses'] });
        },
    });
}

/**
 * Hook: Unpublish course
 */
export function useUnpublishCourse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => coursesApi.unpublish(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['courses', id] });
            queryClient.invalidateQueries({ queryKey: ['courses'] });
        },
    });
}
