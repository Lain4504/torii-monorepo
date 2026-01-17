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
    return response.data.data!.session;
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
    return response.data.data!.session;
}

/**
 * Submit exam session
 * POST /api/exams/sessions/:sessionId/submit
 */
export async function submitExam(sessionId: string): Promise<ExamSessionResponseDTO> {
    const response = await apiClient.post<StandardApiResponse<{ session: ExamSessionResponseDTO }>>(`/api/exams/sessions/${sessionId}/submit`);
    return response.data.data!.session;
}

/**
 * Get list of exams with user session status
 * GET /api/exams
 */
export async function getExams(query?: ExamQueryDTO): Promise<PaginatedApiResponse<ExamWithStatusResponseDTO>> {
    const response = await apiClient.get<PaginatedApiResponse<ExamWithStatusResponseDTO>>('/api/exams', { params: query });
    return response.data;
}

/**
 * Get user's exam attempts (history)
 * GET /api/exams/attempts
 */
export async function getExamAttempts(query?: ExamSessionQueryDTO): Promise<PaginatedApiResponse<ExamSessionWithExamResponseDTO>> {
    const response = await apiClient.get<PaginatedApiResponse<ExamSessionWithExamResponseDTO>>('/api/exams/attempts', { params: query });
    return response.data;
}

/**
 * Get attempt details with explanations
 * GET /api/exams/sessions/:sessionId/details
 */
export async function getAttemptDetails(sessionId: string): Promise<any> {
    const response = await apiClient.get<StandardApiResponse<{ session: any }>>(`/api/exams/sessions/${sessionId}/details`);
    return response.data.data!.session;
}

// Convenience wrapper for easier imports in pages
export const examApi = {
    startExam,
    saveExamAnswers,
    submitExam,
    getExams,
    getExamAttempts,
    getAttemptDetails,
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
