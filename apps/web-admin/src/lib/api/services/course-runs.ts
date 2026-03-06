import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client.ts';
import type {
    PaginatedApiResponse,
    CourseRunResponseDTO,
    CourseRunCreateDTO,
    CourseRunUpdateDTO,
    CourseRunSearchRequestDTO,
    StandardApiResponse,
} from '@workspace/schemas';
import { CourseRunStatus } from '@workspace/schemas';

// ============================================================================
// API Functions
// ============================================================================

export const courseRunsApi = {
    // GET /api/course-runs
    async findAll(params: CourseRunSearchRequestDTO): Promise<PaginatedApiResponse<CourseRunResponseDTO>> {
        const response = await apiClient.get<PaginatedApiResponse<CourseRunResponseDTO>>('/api/course-runs', { params });
        return response.data;
    },

    // GET /api/course-runs/my
    async findMy(params: CourseRunSearchRequestDTO): Promise<PaginatedApiResponse<CourseRunResponseDTO>> {
        const response = await apiClient.get<PaginatedApiResponse<CourseRunResponseDTO>>('/api/course-runs/my', { params });
        return response.data;
    },

    // GET /api/course-runs/:id
    async findById(id: string): Promise<CourseRunResponseDTO> {
        const response = await apiClient.get<StandardApiResponse<{ run: CourseRunResponseDTO }>>(`/api/course-runs/${id}`);
        return response.data.data!.run;
    },

    // POST /api/course-runs
    async create(run: CourseRunCreateDTO): Promise<CourseRunResponseDTO> {
        const response = await apiClient.post<StandardApiResponse<{ run: CourseRunResponseDTO }>>('/api/course-runs', run);
        return response.data.data!.run;
    },

    // PUT /api/course-runs/:id
    async update(id: string, run: CourseRunUpdateDTO): Promise<CourseRunResponseDTO> {
        const response = await apiClient.put<StandardApiResponse<{ run: CourseRunResponseDTO }>>(`/api/course-runs/${id}`, run);
        return response.data.data!.run;
    },

    // PATCH /api/course-runs/:id/status
    async updateStatus(id: string, status: CourseRunStatus): Promise<CourseRunResponseDTO> {
        const response = await apiClient.patch<StandardApiResponse<{ run: CourseRunResponseDTO }>>(
            `/api/course-runs/${id}/status`,
            { status },
        );
        return response.data.data!.run;
    },

    // DELETE /api/course-runs/:id
    async delete(id: string): Promise<boolean> {
        const response = await apiClient.delete<StandardApiResponse<boolean>>(`/api/course-runs/${id}`);
        return response.data.success;
    },

    // POST /api/course-runs/:id/submit-review
    async submitForReview(id: string): Promise<CourseRunResponseDTO> {
        const response = await apiClient.post<StandardApiResponse<{ run: CourseRunResponseDTO }>>(
            `/api/course-runs/${id}/submit-review`,
            {},
        );
        return response.data.data!.run;
    },

    // POST /api/course-runs/:id/review
    async reviewContent(
        id: string,
        payload: {
            outcome: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUIRED';
            checklist?: Record<string, any>;
            comments?: string;
            rejectionReason?: string;
            moveToPlanning?: boolean;
            moveToEnrolling?: boolean;
        },
    ): Promise<CourseRunResponseDTO> {
        const response = await apiClient.post<StandardApiResponse<{ run: CourseRunResponseDTO }>>(
            `/api/course-runs/${id}/review`,
            payload,
        );
        return response.data.data!.run;
    },


};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook: Get course runs list with pagination and filters
 */
export function useCourseRuns(params: CourseRunSearchRequestDTO) {
    return useQuery({
        queryKey: ['course-runs', params],
        queryFn: () => courseRunsApi.findAll(params),
        enabled: true,
    });
}

/**
 * Hook: Get my course runs
 */
export function useMyCourseRuns(params: CourseRunSearchRequestDTO) {
    return useQuery({
        queryKey: ['my-course-runs', params],
        queryFn: () => courseRunsApi.findMy(params),
    });
}

/**
 * Hook: Get single course run by ID
 */
export function useCourseRun(id: string) {
    return useQuery({
        queryKey: ['course-runs', id],
        queryFn: () => courseRunsApi.findById(id),
        enabled: !!id,
    });
}

/**
 * Hook: Create new course run
 */
export function useCreateCourseRun() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (run: CourseRunCreateDTO) => courseRunsApi.create(run),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['course-runs', { courseMasterId: variables.courseMasterId }] });
        },
    });
}

/**
 * Hook: Update course run
 */
export function useUpdateCourseRun() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, run }: { id: string; run: CourseRunUpdateDTO }) =>
            courseRunsApi.update(id, run),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['course-runs', data.id] });
            queryClient.invalidateQueries({ queryKey: ['course-runs', { courseMasterId: data.courseMasterId }] });
        },
    });
}

/**
 * Hook: Update course run status
 */
export function useUpdateCourseRunStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: CourseRunStatus }) =>
            courseRunsApi.updateStatus(id, status),
        onSuccess: (data) => {
            // Invalidate both single run and list for this course master
            queryClient.invalidateQueries({ queryKey: ['course-runs', data.id] });
            queryClient.invalidateQueries({ queryKey: ['course-runs', { courseMasterId: data.courseMasterId }] });
        },
    });
}

/**
 * Hook: Delete course run
 */
export function useDeleteCourseRun() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => courseRunsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['course-runs'] });
        },
    });
}

/**
 * Hook: Submit course run for content review
 */
export function useSubmitCourseRunForReview() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => courseRunsApi.submitForReview(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['course-runs', data.id] });
            queryClient.invalidateQueries({ queryKey: ['course-runs', { courseMasterId: data.courseMasterId }] });
        },
    });
}

/**
 * Hook: Review course run content (Staff-LMS)
 */
export function useReviewCourseRunContent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: {
                outcome: 'APPROVED' | 'REJECTED' | 'CHANGES_REQUIRED';
                checklist?: Record<string, any>;
                comments?: string;
                rejectionReason?: string;
                moveToPlanning?: boolean;
                moveToEnrolling?: boolean;
            };
        }) => courseRunsApi.reviewContent(id, payload),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['course-runs', data.id] });
            queryClient.invalidateQueries({ queryKey: ['course-runs', { courseMasterId: data.courseMasterId }] });
        },
    });
}


