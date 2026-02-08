import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type { StandardApiResponse, PaginatedApiResponse } from '@workspace/schemas';

export interface AssignmentResponseDTO {
  id: string;
  title: string;
  description?: string;
  type: 'TEXT' | 'FILE' | 'BOTH';
  courseId: string;
  moduleId?: string;
  lessonId?: string;
  maxScore: number;
  passingScore?: number;
  dueDate?: string;
  allowLateSubmission: boolean;
  latePenaltyPercent?: number;
  allowedFileTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  instructions?: string;
  attachmentUrls?: string[];
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmissionResponseDTO {
  id: string;
  assignmentId: string;
  userId: string;
  textAnswer?: string;
  fileUrls?: string[];
  status: 'DRAFT' | 'SUBMITTED' | 'GRADED' | 'RETURNED';
  score?: number;
  feedback?: string;
  submittedAt?: string;
  gradedAt?: string;
  gradedBy?: string;
  isLate: boolean;
  daysLate?: number;
  attemptNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitAssignmentDto {
  textAnswer?: string;
  fileUrls?: string[];
}

export interface AssignmentQueryParams {
  page?: number;
  limit?: number;
  courseId?: string;
  moduleId?: string;
  lessonId?: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'CLOSED';
}

export const assignmentApi = {
  /**
   * Get assignment by ID
   */
  getAssignment: async (id: string): Promise<AssignmentResponseDTO> => {
    const response = await apiClient.get<StandardApiResponse<{ assignment: AssignmentResponseDTO }>>(
      `/api/assignments/${id}`
    );
    return response.data.data!.assignment;
  },

  /**
   * Get all assignments for a course with pagination
   */
  getCourseAssignments: async (params: AssignmentQueryParams = {}): Promise<PaginatedApiResponse<AssignmentResponseDTO>> => {
    const response = await apiClient.get<PaginatedApiResponse<AssignmentResponseDTO>>(
      '/api/assignments',
      { params }
    );
    return response.data;
  },

  /**
   * Get all assignments for the current user (across all enrolled courses)
   */
  getMyAssignments: async (params: Omit<AssignmentQueryParams, 'courseId'> = {}): Promise<PaginatedApiResponse<AssignmentResponseDTO>> => {
    const response = await apiClient.get<PaginatedApiResponse<AssignmentResponseDTO>>(
      '/api/assignments',
      { params: { ...params, status: 'PUBLISHED' } }
    );
    return response.data;
  },

  /**
   * Get current user's submission for an assignment
   */
  getMySubmission: async (assignmentId: string): Promise<SubmissionResponseDTO | null> => {
    const response = await apiClient.get<StandardApiResponse<{ submission: SubmissionResponseDTO | null }>>(
      `/api/submissions/my/${assignmentId}`
    );
    return response.data.data!.submission;
  },

  /**
   * Submit assignment officially
   */
  submitAssignment: async (assignmentId: string, dto: SubmitAssignmentDto): Promise<SubmissionResponseDTO> => {
    const response = await apiClient.post<StandardApiResponse<{ submission: SubmissionResponseDTO }>>(
      `/api/submissions/${assignmentId}`,
      dto
    );
    return response.data.data!.submission;
  },

  /**
   * Save assignment as draft
   */
  saveDraft: async (assignmentId: string, dto: SubmitAssignmentDto): Promise<SubmissionResponseDTO> => {
    const response = await apiClient.post<StandardApiResponse<{ submission: SubmissionResponseDTO }>>(
      `/api/submissions/${assignmentId}/draft`,
      dto
    );
    return response.data.data!.submission;
  },

  /**
   * Download assignment attachment file
   */
  downloadAttachment: async (url: string, filename: string): Promise<void> => {
    try {
      // For external URLs (S3, MinIO, etc.), open directly in new tab
      // Browser will handle download based on Content-Disposition header
      if (url.startsWith('http')) {
        window.open(url, '_blank');
      } else {
        // For relative URLs, prepend base URL
        const downloadUrl = `${apiClient.defaults.baseURL}${url}`;
        window.open(downloadUrl, '_blank');
      }
    } catch (error: any) {
      console.error('Download error:', error);
      throw error;
    }
  },
};

/**
 * Hook: Get assignment by ID
 */
export function useAssignment(assignmentId: string) {
  return useQuery({
    queryKey: ['assignments', assignmentId],
    queryFn: () => assignmentApi.getAssignment(assignmentId),
    enabled: !!assignmentId,
  });
}

/**
 * Hook: Get course assignments with pagination
 */
export function useCourseAssignments(params: AssignmentQueryParams) {
  return useQuery({
    queryKey: ['assignments', 'course', params],
    queryFn: () => assignmentApi.getCourseAssignments(params),
    enabled: !!params.courseId,
  });
}

/**
 * Hook: Get all assignments for current user
 */
export function useMyAssignments(params: Omit<AssignmentQueryParams, 'courseId'> = {}) {
  return useQuery({
    queryKey: ['assignments', 'my', params],
    queryFn: () => assignmentApi.getMyAssignments(params),
  });
}

/**
 * Hook: Get my submission for an assignment
 */
export function useMySubmission(assignmentId: string) {
  return useQuery({
    queryKey: ['submissions', 'my', assignmentId],
    queryFn: () => assignmentApi.getMySubmission(assignmentId),
    enabled: !!assignmentId,
  });
}

/**
 * Hook: Submit assignment
 */
export function useSubmitAssignment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, dto }: { assignmentId: string; dto: SubmitAssignmentDto }) =>
      assignmentApi.submitAssignment(assignmentId, dto),
    onSuccess: (_, variables) => {
      // Invalidate and refetch submission query
      queryClient.invalidateQueries({ queryKey: ['submissions', 'my', variables.assignmentId] });
      // Also invalidate assignment queries to update status
      queryClient.invalidateQueries({ queryKey: ['assignments'] });
      // Refetch immediately
      queryClient.refetchQueries({ queryKey: ['submissions', 'my', variables.assignmentId] });
    },
  });
}


/**
 * Hook: Save draft
 */
export function useSaveDraft() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ assignmentId, dto }: { assignmentId: string; dto: SubmitAssignmentDto }) =>
      assignmentApi.saveDraft(assignmentId, dto),
    onSuccess: (_, variables) => {
      // Invalidate submission query to refetch
      queryClient.invalidateQueries({ queryKey: ['submissions', 'my', variables.assignmentId] });
    },
  });
}
