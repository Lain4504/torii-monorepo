import { apiClient } from '../api-client';
import type {
    ExamSessionStartResponseDTO,
    ExamSessionAnswersDTO,
    ExamSessionResponseDTO,
    ExamWithStatusResponseDTO,
    ExamSessionQueryDTO,
    ExamQueryDTO,
    PaginatedResponseDTO,
    ExamSessionWithExamResponseDTO,
} from '@workspace/schemas';

/**
 * Start an exam session
 * POST /api/exams/:id/start
 */
export async function startExam(examId: string): Promise<ExamSessionStartResponseDTO> {
    const response = await apiClient.post(`/api/exams/${examId}/start`);
    // NestJS returns data directly, not wrapped
    return response.data;
}

/**
 * Save exam session answers
 * PUT /api/exams/sessions/:sessionId/answers
 */
export async function saveExamAnswers(
    sessionId: string,
    data: ExamSessionAnswersDTO
): Promise<ExamSessionResponseDTO> {
    const response = await apiClient.put(`/api/exams/sessions/${sessionId}/answers`, data);
    // NestJS returns data directly, not wrapped
    return response.data;
}

/**
 * Submit exam session
 * POST /api/exams/sessions/:sessionId/submit
 */
export async function submitExam(sessionId: string): Promise<ExamSessionResponseDTO> {
    const response = await apiClient.post(`/api/exams/sessions/${sessionId}/submit`);
    // NestJS returns data directly, not wrapped
    return response.data;
}

/**
 * Get list of exams with user session status
 * GET /api/exams
 */
export async function getExams(query?: ExamQueryDTO): Promise<PaginatedResponseDTO<ExamWithStatusResponseDTO>> {
    const response = await apiClient.get('/api/exams', { params: query });
    // NestJS returns PaginatedResponse directly: { data: [...], total, page, limit, totalPages }
    return response.data;
}

/**
 * Get user's exam attempts (history)
 * GET /api/exams/attempts
 */
export async function getExamAttempts(query?: ExamSessionQueryDTO): Promise<PaginatedResponseDTO<ExamSessionWithExamResponseDTO>> {
    const response = await apiClient.get('/api/exams/attempts', { params: query });
    // NestJS returns PaginatedResponse directly, not wrapped
    return response.data;
}

/**
 * Get attempt details with explanations
 * GET /api/exams/sessions/:sessionId/details
 */
export async function getAttemptDetails(sessionId: string): Promise<any> {
    const response = await apiClient.get(`/api/exams/sessions/${sessionId}/details`);
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
};










