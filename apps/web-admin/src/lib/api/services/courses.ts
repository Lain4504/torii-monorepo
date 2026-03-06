import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client.ts';
import type { PaginatedApiResponse, CourseMasterResponseDTO, CourseMasterCreateDTO, CourseMasterUpdateDTO, CourseMasterQueryDTO, StandardApiResponse } from '@workspace/schemas';

// ============================================================================
// API Functions
// ============================================================================

export const coursesApi = {
    // GET /api/course-masters
    async findAll(params: CourseMasterQueryDTO): Promise<PaginatedApiResponse<CourseMasterResponseDTO>> {
        const response = await apiClient.get<PaginatedApiResponse<CourseMasterResponseDTO>>('/api/course-masters', { params });
        return response.data;
    },

    // GET /api/course-masters/:id
    async findById(id: string): Promise<CourseMasterResponseDTO> {
        const response = await apiClient.get<StandardApiResponse<{ course: CourseMasterResponseDTO }>>(`/api/course-masters/${id}`);
        return response.data.data!.course;
    },

    // POST /api/course-masters
    async create(course: CourseMasterCreateDTO): Promise<CourseMasterResponseDTO> {
        const response = await apiClient.post<StandardApiResponse<{ course: CourseMasterResponseDTO }>>('/api/course-masters', course);
        return response.data.data!.course;
    },

    // PUT /api/course-masters/:id
    async update(id: string, course: CourseMasterUpdateDTO): Promise<CourseMasterResponseDTO> {
        const response = await apiClient.put<StandardApiResponse<{ course: CourseMasterResponseDTO }>>(`/api/course-masters/${id}`, course);
        return response.data.data!.course;
    },

    // DELETE /api/course-masters/:id
    async delete(id: string): Promise<boolean> {
        const response = await apiClient.delete<StandardApiResponse<boolean>>(`/api/course-masters/${id}`);
        return response.data.success;
    },

    // PATCH /api/course-masters/:id/restore
    async restore(id: string): Promise<CourseMasterResponseDTO> {
        const response = await apiClient.patch<StandardApiResponse<{ course: CourseMasterResponseDTO }>>(`/api/course-masters/${id}/restore`);
        return response.data.data!.course;
    },

    // POST /api/course-masters/:id/publish
    async publish(id: string): Promise<CourseMasterResponseDTO> {
        const response = await apiClient.post<StandardApiResponse<{ course: CourseMasterResponseDTO }>>(`/api/course-masters/${id}/publish`);
        return response.data.data!.course;
    },

    // POST /api/course-masters/:id/submit-for-review
    async submitForReview(id: string): Promise<CourseMasterResponseDTO> {
        const response = await apiClient.post<StandardApiResponse<{ course: CourseMasterResponseDTO }>>(`/api/course-masters/${id}/submit-for-review`);
        return response.data.data!.course;
    },

    // POST /api/course-masters/:id/unpublish
    async unpublish(id: string): Promise<CourseMasterResponseDTO> {
        const response = await apiClient.post<StandardApiResponse<{ course: CourseMasterResponseDTO }>>(`/api/course-masters/${id}/unpublish`);
        return response.data.data!.course;
    },

    async updateLiveConfig(id: string, config: any): Promise<CourseMasterResponseDTO> {
        const response = await apiClient.patch<StandardApiResponse<{ course: CourseMasterResponseDTO }>>(`/api/course-masters/${id}/live-config`, config);
        return response.data.data!.course;
    },

    // POST /api/course-masters/:id/review
    async reviewSyllabus(id: string, payload: {
        outcome: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUIRED';
        checklist?: Record<string, any>;
        comments?: string;
        rejectionReason?: string;
    }): Promise<CourseMasterResponseDTO> {
        const response = await apiClient.post<StandardApiResponse<{ course: CourseMasterResponseDTO }>>(`/api/course-masters/${id}/review`, payload);
        return response.data.data!.course;
    },

    // POST /api/course-masters/:id/reject
    async reject(id: string, reason: string): Promise<CourseMasterResponseDTO> {
        const response = await apiClient.post<StandardApiResponse<{ course: CourseMasterResponseDTO }>>(`/api/course-masters/${id}/reject`, { reason });
        return response.data.data!.course;
    },

    // GET /api/course-masters/:id/versions
    async getVersionHistory(id: string): Promise<Array<{
        id: string;
        versionTag: string;
        createdAt: Date;
        createdBy?: string;
        changelog?: string;
        totalModules?: number;
        totalLessons?: number;
    }>> {
        const response = await apiClient.get<StandardApiResponse<{ versions: any[] }>>(`/api/course-masters/${id}/versions`);
        return response.data.data!.versions;
    },
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook: Get courses list with pagination and filters
 */
export function useCourses(params: CourseMasterQueryDTO) {
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
        queryFn: () => coursesApi.findById(id),
        enabled: !!id,
    });
}

/**
 * Hook: Create new course
 */
export function useCreateCourse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (course: CourseMasterCreateDTO) => coursesApi.create(course),
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
        mutationFn: ({ id, course }: { id: string; course: CourseMasterUpdateDTO }) =>
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
 * Hook: Reject course
 */
export function useRejectCourse() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) => coursesApi.reject(id, reason),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['courses', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['courses'] });
        },
    });
}

/**
 * Hook: Review syllabus (Staff-LMS)
 */
export function useReviewSyllabus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: any }) => coursesApi.reviewSyllabus(id, payload),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['courses', variables.id] });
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

/**
 * Hook: Submit course for review
 */
export function useSubmitCourseForReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => coursesApi.submitForReview(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['courses', id] });
            queryClient.invalidateQueries({ queryKey: ['courses'] });
        },
    });
}

/**
 * Hook: Update livestream configuration
 */
export function useUpdateLiveConfig() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, config }: { id: string; config: any }) => coursesApi.updateLiveConfig(id, config),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['courses', variables.id] });
        },
    });
}

/**
 * Hook: Get version history
 */
export function useCourseVersionHistory(id: string) {
    return useQuery({
        queryKey: ['courses', id, 'versions'],
        queryFn: () => coursesApi.getVersionHistory(id),
        enabled: !!id,
        staleTime: 30000,
    });
}

