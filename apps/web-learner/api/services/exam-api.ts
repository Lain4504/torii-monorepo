import { apiClient } from '../api-client';
import type {
    ExamSessionStartResponseDTO,
    ExamSessionAnswersDTO,
    ExamSessionResponseDTO,
    ExamWithStatusResponseDTO,
    ExamSessionQueryDTO,
    ExamQueryDTO,
    PaginatedResponse,
} from '@workspace/schemas';

/**
 * Start an exam session
 * POST /api/v1/exams/:id/start
 */
export async function startExam(examId: string): Promise<ExamSessionStartResponseDTO> {
    const response = await apiClient.post(`/api/v1/exams/${examId}/start`);
    // NestJS returns data directly, not wrapped
    return response.data;
}

/**
 * Save exam session answers
 * PUT /api/v1/exams/sessions/:sessionId/answers
 */
export async function saveExamAnswers(
    sessionId: string,
    data: ExamSessionAnswersDTO
): Promise<ExamSessionResponseDTO> {
    const response = await apiClient.put(`/api/v1/exams/sessions/${sessionId}/answers`, data);
    // NestJS returns data directly, not wrapped
    return response.data;
}

/**
 * Submit exam session
 * POST /api/v1/exams/sessions/:sessionId/submit
 */
export async function submitExam(sessionId: string): Promise<ExamSessionResponseDTO> {
    const response = await apiClient.post(`/api/v1/exams/sessions/${sessionId}/submit`);
    // NestJS returns data directly, not wrapped
    return response.data;
}

/**
 * Get list of exams with user session status
 * GET /api/v1/exams
 */
export async function getExams(query?: ExamQueryDTO): Promise<PaginatedResponse<ExamWithStatusResponseDTO>> {
    const response = await apiClient.get('/api/v1/exams', { params: query });
    // NestJS returns PaginatedResponse directly: { data: [...], total, page, limit, totalPages }
    return response.data;
}

/**
 * Get user's exam attempts (history)
 * GET /api/v1/exams/attempts
 */
export async function getExamAttempts(query?: ExamSessionQueryDTO): Promise<PaginatedResponse<ExamSessionWithExamResponseDTO>> {
    const response = await apiClient.get('/api/v1/exams/attempts', { params: query });
    // NestJS returns PaginatedResponse directly, not wrapped
    return response.data;
}










