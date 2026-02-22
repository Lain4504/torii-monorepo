import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type {
    ExamSessionStartResponseDTO,
    ExamSessionAnswersDTO,
    ExamSessionResponseDTO,
    ExamWithStatusResponseDTO,
    ExamSessionQueryDTO,
    ExamQueryDTO,
    ExamSessionWithExamResponseDTO,
    StandardApiResponse,
    PaginatedApiResponse,
} from '@workspace/schemas';

/**
 * Start an exam session
 * POST /api/exams/:id/start
 */
export async function startExam(examId: string): Promise<ExamSessionStartResponseDTO> {
    const response = await apiClient.post<StandardApiResponse<{ session: ExamSessionStartResponseDTO }>>(`/api/exams/${examId}/start`);
    if (!response.data?.success || !response.data?.data?.session) {
        throw new Error(response.data?.message || 'Failed to start exam session');
    }
    return response.data.data.session;
}

/**
 * Save exam session answers
 * PUT /api/exams/sessions/:sessionId/answers
 */
export async function saveExamAnswers(
    sessionId: string,
    data: ExamSessionAnswersDTO
): Promise<ExamSessionResponseDTO> {
    const response = await apiClient.put<StandardApiResponse<{ session: ExamSessionResponseDTO }>>(`/api/exams/sessions/${sessionId}/answers`, data);
    if (!response.data?.success || !response.data?.data?.session) {
        throw new Error(response.data?.message || 'Failed to save answers');
    }
    return response.data.data.session;
}

/**
 * Submit exam session
 * POST /api/exams/sessions/:sessionId/submit
 */
export async function submitExam(sessionId: string): Promise<ExamSessionResponseDTO> {
    const response = await apiClient.post<StandardApiResponse<{ session: ExamSessionResponseDTO }>>(`/api/exams/sessions/${sessionId}/submit`);
    if (!response.data?.success || !response.data?.data?.session) {
        throw new Error(response.data?.message || 'Failed to submit exam');
    }
    return response.data.data.session;
}

/**
 * Get list of exams with user session status
 * GET /api/exams
 */
export async function getExams(query?: ExamQueryDTO): Promise<PaginatedApiResponse<ExamWithStatusResponseDTO>> {
    const response = await apiClient.post<PaginatedApiResponse<ExamWithStatusResponseDTO>>('/api/exams/search', query || {});
    return response.data;
}

/**
 * Get user's exam attempts (history)
 * GET /api/exams/attempts
 */
export async function getExamAttempts(query?: ExamSessionQueryDTO): Promise<PaginatedApiResponse<ExamSessionWithExamResponseDTO>> {
    const response = await apiClient.post<PaginatedApiResponse<ExamSessionWithExamResponseDTO>>('/api/exams/attempts/search', query || {});
    return response.data;
}

/**
 * Get attempt details with explanations
 * GET /api/exams/sessions/:sessionId/details
 */
export async function getAttemptDetails(sessionId: string): Promise<any> {
    const response = await apiClient.get<StandardApiResponse<{ session: any }>>(`/api/exams/sessions/${sessionId}/details`);
    if (!response.data?.success || !response.data?.data?.session) {
        throw new Error(response.data?.message || 'Failed to fetch attempt details');
    }
    return response.data.data.session;
}

/**
 * Get exam by ID with user session status
 * GET /api/exams/:id
 */
export async function getExamById(examId: string): Promise<ExamWithStatusResponseDTO> {
    const response = await apiClient.get<StandardApiResponse<{ exam: ExamWithStatusResponseDTO }>>(`/api/exams/${examId}`);
    if (!response.data?.success || !response.data?.data?.exam) {
        throw new Error(response.data?.message || 'Failed to fetch exam');
    }
    return response.data.data.exam;
}

/**
 * Get all sessions for a specific exam
 * GET /api/exams/:id/sessions
 */
export async function getExamSessions(examId: string, query?: ExamSessionQueryDTO): Promise<PaginatedApiResponse<ExamSessionWithExamResponseDTO>> {
    const response = await apiClient.post<PaginatedApiResponse<ExamSessionWithExamResponseDTO>>(`/api/exams/${examId}/sessions/search`, query || {});
    return response.data;
}

// Convenience wrapper for easier imports in pages
export const examApi = {
    startExam,
    saveExamAnswers,
    submitExam,
    getExams,
    getExamAttempts,
    getAttemptDetails,
    getExamById,
    getExamSessions,
};












/**
 * Hook: Start Exam
 */
export function useStartExam() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (examId: string) => examApi.startExam(examId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exams', 'attempts'] });
        }
    });
}

/**
 * Hook: Save Exam Answers
 */
export function useSaveExamAnswers() {
    return useMutation({
        mutationFn: (variables: { sessionId: string, data: ExamSessionAnswersDTO }) =>
            examApi.saveExamAnswers(variables.sessionId, variables.data),
    });
}

/**
 * Hook: Submit Exam
 */
export function useSubmitExam() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (sessionId: string) => examApi.submitExam(sessionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exams', 'attempts'] });
        }
    });
}

/**
 * Hook: Get Exams List
 */
export function useExams(query?: ExamQueryDTO) {
    return useQuery({
        queryKey: ['exams', query],
        queryFn: () => examApi.getExams(query),
    });
}

/**
 * Hook: Get Exam Attempts
 */
export function useExamAttempts(query?: ExamSessionQueryDTO) {
    return useQuery({
        queryKey: ['exams', 'attempts', query],
        queryFn: () => examApi.getExamAttempts(query),
    });
}

/**
 * Hook: Get Attempt Details
 */
export function useAttemptDetails(sessionId: string) {
    return useQuery({
        queryKey: ['exams', 'attempts', sessionId],
        queryFn: () => examApi.getAttemptDetails(sessionId),
        enabled: !!sessionId,
    });
}

/**
 * Hook: Get Exam By ID
 */
export function useExamById(examId: string) {
    return useQuery({
        queryKey: ['exams', examId],
        queryFn: () => examApi.getExamById(examId),
        enabled: !!examId,
    });
}

/**
 * Hook: Get Exam Sessions
 */
export function useExamSessions(examId: string, query?: ExamSessionQueryDTO) {
    return useQuery({
        queryKey: ['exams', examId, 'sessions', query],
        queryFn: () => examApi.getExamSessions(examId, query),
        enabled: !!examId,
    });
}
