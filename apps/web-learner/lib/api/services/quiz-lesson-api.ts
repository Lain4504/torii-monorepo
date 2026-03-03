import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type { StandardApiResponse, PaginatedApiResponse } from '@workspace/schemas';

// ============================================================================
// Types
// ============================================================================

export interface QuizResponseDTO {
    id: string;
    title: string;
    description?: string;
    quizType: string; // 'lesson' | 'module' | 'course' | 'practice' | 'jlpt_mock'
    jlptLevel?: string;
    courseRunId?: string;
    lessonId?: string;
    totalTime?: number; // minutes
    totalQuestions: number;
    passingScore?: number;
    maxAttempts: number;
    shuffleQuestions: boolean;
    showExplanation: boolean;
    status: string;
    createdAt: string;
    updatedAt: string;
    // Status fields when user context provided
    sessionStatus?: 'in_progress' | 'submitted' | 'completed';
    sessionId?: string;
    score?: number;
    maxScore?: number;
    progress?: number;
    lastAttemptDate?: string;
}

export interface QuizQuestionDTO {
    id: string;
    questionText: string;
    questionType: 'multiple_choice' | 'true_false' | 'fill_blank' | 'matching' | 'essay';
    options?: Record<string, any>;
    audioUrl?: string;
    section?: string;
    order: number;
}

export interface QuizSessionDTO {
    sessionId: string;
    exam: QuizResponseDTO;
    questions: QuizQuestionDTO[];
    timeLimit: number; // seconds
    sections?: any[];
    answers: Record<string, string>;
    flaggedQuestions: string[];
    currentQuestion: number;
    timeRemaining: number;
}

export interface QuizSessionResultDTO {
    id: string;
    quizId: string;
    userId: string;
    status: string;
    startedAt: string;
    submittedAt?: string;
    score?: number;
    maxScore?: number;
    percentage?: number;
    isPassed?: boolean;
    timeTakenSeconds?: number;
    attemptNumber: number;
}

export interface SaveAnswersDTO {
    answers: Record<string, string>;
    flaggedQuestions?: string[];
    currentSection?: string;
    currentQuestion?: number;
    timeRemaining?: number;
}

// ============================================================================
// API
// ============================================================================

export const quizLessonApi = {
    /**
     * Get quizzes linked to a specific lesson (optionally scoped by courseRunId)
     */
    getByLesson: async (lessonId: string, courseRunId?: string): Promise<QuizResponseDTO | null> => {
        const params: Record<string, unknown> = {
            lessonId,
            status: 'published',
            limit: 1,
        };

        if (courseRunId) {
            params.courseRunId = courseRunId;
        }

        const response = await apiClient.get<PaginatedApiResponse<QuizResponseDTO>>(
            '/api/exams',
            { params }
        );
        const items = response.data?.data;
        return Array.isArray(items) && items.length > 0 ? (items[0] as QuizResponseDTO) : null;
    },

    /**
     * Start a quiz session (or resume existing)
     */
    startQuiz: async (examId: string): Promise<QuizSessionDTO> => {
        const response = await apiClient.post<StandardApiResponse<QuizSessionDTO>>(
            `/api/exams/${examId}/start`,
            {}
        );
        return response.data.data!;
    },

    /**
     * Save answers (auto-save)
     */
    saveAnswers: async (sessionId: string, data: SaveAnswersDTO): Promise<QuizSessionResultDTO> => {
        const response = await apiClient.put<StandardApiResponse<QuizSessionResultDTO>>(
            `/api/exams/sessions/${sessionId}/answers`,
            data
        );
        return response.data.data!;
    },

    /**
     * Submit quiz for grading
     */
    submitQuiz: async (sessionId: string): Promise<QuizSessionResultDTO> => {
        const response = await apiClient.post<StandardApiResponse<QuizSessionResultDTO>>(
            `/api/exams/sessions/${sessionId}/submit`,
            {}
        );
        return response.data.data!;
    },

    /**
     * Get user's exam attempts for a quiz
     */
    getAttempts: async (examId: string): Promise<QuizSessionResultDTO[]> => {
        const response = await apiClient.get<PaginatedApiResponse<QuizSessionResultDTO>>(
            '/api/exams/attempts',
            { params: { examId, limit: 10 } }
        );
        return response.data?.data || [];
    },
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook: Get quiz linked to a lesson
 */
export function useQuizByLesson(lessonId: string | undefined, courseRunId?: string) {
    return useQuery({
        queryKey: ['quizzes', 'lesson', lessonId, courseRunId],
        queryFn: () => quizLessonApi.getByLesson(lessonId!, courseRunId),
        enabled: !!lessonId && !!courseRunId,
        staleTime: 60_000,
    });
}

/**
 * Hook: Start quiz session
 */
export function useStartQuiz() {
    return useMutation({
        mutationFn: (examId: string) => quizLessonApi.startQuiz(examId),
    });
}

/**
 * Hook: Save answers (auto-save)
 */
export function useSaveQuizAnswers() {
    return useMutation({
        mutationFn: ({ sessionId, data }: { sessionId: string; data: SaveAnswersDTO }) =>
            quizLessonApi.saveAnswers(sessionId, data),
    });
}

/**
 * Hook: Submit quiz
 */
export function useSubmitQuiz() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (sessionId: string) => quizLessonApi.submitQuiz(sessionId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quizzes'] });
        },
    });
}

/**
 * Hook: Get quiz attempts
 */
export function useQuizAttempts(examId: string | undefined) {
    return useQuery({
        queryKey: ['quizzes', 'attempts', examId],
        queryFn: () => quizLessonApi.getAttempts(examId!),
        enabled: !!examId,
    });
}
