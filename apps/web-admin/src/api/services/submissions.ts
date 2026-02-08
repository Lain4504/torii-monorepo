import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/api-client.ts';
import type { 
  SubmissionResponseDTO, 
  GradeSubmissionDto, 
  ReturnSubmissionDto, 
  QuerySubmissionsDto, 
  StandardApiResponse 
} from '@workspace/schemas';

// ============================================================================
// API Functions
// ============================================================================

export const submissionsApi = {
    // GET /api/submissions/assignment/:assignmentId
    async findByAssignment(assignmentId: string): Promise<SubmissionResponseDTO[]> {
        const response = await apiClient.get<StandardApiResponse<{ submissions: SubmissionResponseDTO[] }>>(`/api/submissions/assignment/${assignmentId}`);
        return response.data.data!.submissions;
    },

    // GET /api/submissions/:id
    async findOne(id: string): Promise<SubmissionResponseDTO> {
        const response = await apiClient.get<StandardApiResponse<{ submission: SubmissionResponseDTO }>>(`/api/submissions/${id}`);
        return response.data.data!.submission;
    },

    // PUT /api/submissions/:id/grade
    async grade(id: string, data: GradeSubmissionDto): Promise<SubmissionResponseDTO> {
        const response = await apiClient.put<StandardApiResponse<{ submission: SubmissionResponseDTO }>>(`/api/submissions/${id}/grade`, data);
        return response.data.data!.submission;
    },

    // PUT /api/submissions/:id/return
    async return(id: string, data: ReturnSubmissionDto): Promise<SubmissionResponseDTO> {
        const response = await apiClient.put<StandardApiResponse<{ submission: SubmissionResponseDTO }>>(`/api/submissions/${id}/return`, data);
        return response.data.data!.submission;
    },
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook: Get submissions for an assignment
 */
export function useSubmissions(assignmentId: string) {
    return useQuery({
        queryKey: ['submissions', 'assignment', assignmentId],
        queryFn: () => submissionsApi.findByAssignment(assignmentId),
        enabled: !!assignmentId,
        staleTime: 30000,
    });
}

/**
 * Hook: Get single submission by ID
 */
export function useSubmission(id: string) {
    return useQuery({
        queryKey: ['submissions', id],
        queryFn: () => submissionsApi.findOne(id),
        enabled: !!id,
    });
}

/**
 * Hook: Grade submission
 */
export function useGradeSubmission() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: GradeSubmissionDto }) =>
            submissionsApi.grade(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['submissions', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['submissions'] });
        },
    });
}

/**
 * Hook: Return submission for revision
 */
export function useReturnSubmission() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: ReturnSubmissionDto }) =>
            submissionsApi.return(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['submissions', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['submissions'] });
        },
    });
}
