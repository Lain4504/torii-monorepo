import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { PaginatedResponseDto, CourseResponseDto, CreateCourseDto, UpdateCourseDto, CourseQueryDto } from '@workspace/dtos';

// ============================================================================
// API Functions
// ============================================================================

export const coursesApi = {
    // GET /api/admin/courses
    async findAll(params: CourseQueryDto): Promise<PaginatedResponseDto<CourseResponseDto>> {
        const response = await apiClient.get<PaginatedResponseDto<CourseResponseDto>>('/api/admin/courses', { params });
        return response.data;
    },

    // GET /api/admin/courses/:id
    async findOne(id: string): Promise<CourseResponseDto> {
        const response = await apiClient.get<CourseResponseDto>(`/api/admin/courses/${id}`);
        return response.data;
    },

    // POST /api/admin/courses
    async create(course: CreateCourseDto): Promise<CourseResponseDto> {
        const response = await apiClient.post<CourseResponseDto>('/api/admin/courses', course);
        return response.data;
    },

    // PATCH /api/admin/courses/:id
    async update(id: string, course: UpdateCourseDto): Promise<CourseResponseDto> {
        const response = await apiClient.patch<CourseResponseDto>(`/api/admin/courses/${id}`, course);
        return response.data;
    },

    // DELETE /api/admin/courses/:id
    async delete(id: string): Promise<boolean> {
        const response = await apiClient.delete(`/api/admin/courses/${id}`);
        return response.data;
    },

    // PATCH /api/admin/courses/:id/restore
    async restore(id: string): Promise<CourseResponseDto> {
        const response = await apiClient.patch<CourseResponseDto>(`/api/admin/courses/${id}/restore`);
        return response.data;
    },
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook: Get courses list with pagination and filters
 */
export function useCourses(params: CourseQueryDto) {
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
        mutationFn: (course: CreateCourseDto) => coursesApi.create(course),
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
        mutationFn: ({ id, course }: { id: string; course: UpdateCourseDto }) =>
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
