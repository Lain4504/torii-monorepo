import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/api-client.ts';
import type { StandardApiResponse, PaginatedApiResponse } from '@workspace/schemas';

// ============================================================================
// Types
// ============================================================================

export interface QuizDTO {
    id: string;
    title: string;
    description?: string;
    quizType: string;
    jlptLevel?: string;
    courseMasterId?: string;
    courseRunId?: string;
    lessonId?: string;
    totalTime?: number;
    totalQuestions: number;
    passingScore?: number;
    maxAttempts: number;
    shuffleQuestions: boolean;
    showExplanation: boolean;
    status: string;
    sections?: {
        id: string;
        type: string;
        timeLimit: number;
        questionCount: number;
        poolId?: string;
        questionIds?: string[];
    }[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateQuizDTO {
    title: string;
    description?: string;
    quizType?: string; // default 'lesson'
    examType?: string; // 'practice' or 'test'
    jlptLevel?: string;
    courseRunId?: string;
    lessonId?: string;
    totalTime?: number;
    passingScore?: number;
    maxAttempts?: number;
    shuffleQuestions?: boolean;
    showExplanation?: boolean;
    status?: string;
    sections?: {
        type: string;
        timeLimit: number;
        questionCount: number;
        poolId?: string;
        questionIds?: string[];
    }[];
}

export interface UpdateQuizDTO extends Partial<CreateQuizDTO> { }

export interface QuizQueryDTO {
    page?: number;
    limit?: number;
    courseMasterId?: string;
    courseRunId?: string;
    lessonId?: string;
    status?: string;
    quizType?: string;
    search?: string;
}

// ============================================================================
// API
// ============================================================================

const ADMIN_EXAMS_BASE = '/api/admin/exams';

export const quizApi = {
    async findAll(params: QuizQueryDTO): Promise<PaginatedApiResponse<QuizDTO>> {
        // Admin exams controller wraps result in a StandardApiResponse via successResponse
        const response = await apiClient.get<StandardApiResponse<PaginatedApiResponse<QuizDTO>>>(
            ADMIN_EXAMS_BASE,
            { params }
        );
        return response.data.data!;
    },

    async findById(id: string): Promise<QuizDTO> {
        const response = await apiClient.get<StandardApiResponse<{ exam: QuizDTO }>>(`${ADMIN_EXAMS_BASE}/${id}`);
        return response.data.data!.exam;
    },

    async create(data: CreateQuizDTO): Promise<QuizDTO> {
        const response = await apiClient.post<StandardApiResponse<{ exam: QuizDTO }>>(ADMIN_EXAMS_BASE, data);
        return response.data.data!.exam;
    },

    async update(id: string, data: UpdateQuizDTO): Promise<QuizDTO> {
        const response = await apiClient.put<StandardApiResponse<{ exam: QuizDTO }>>(`${ADMIN_EXAMS_BASE}/${id}`, data);
        return response.data.data!.exam;
    },

    async delete(id: string): Promise<boolean> {
        const response = await apiClient.delete<StandardApiResponse<boolean>>(`${ADMIN_EXAMS_BASE}/${id}`);
        return response.data.success;
    },

    async publish(id: string): Promise<QuizDTO> {
        const response = await apiClient.patch<StandardApiResponse<{ exam: QuizDTO }>>(`${ADMIN_EXAMS_BASE}/${id}/publish`, {});
        return response.data.data!.exam;
    },

    async getQuizQuestions(quizId: string): Promise<any[]> {
        const response = await apiClient.get<StandardApiResponse<{ questions: any[] }>>(`${ADMIN_EXAMS_BASE}/${quizId}/questions`);
        return response.data.data?.questions || [];
    },

};

// ============================================================================
// Hooks
// ============================================================================

export function useQuizzes(params: QuizQueryDTO) {
    return useQuery({
        queryKey: ['quizzes', params],
        queryFn: () => quizApi.findAll(params),
        staleTime: 30_000,
    });
}

export function useQuiz(id: string) {
    return useQuery({
        queryKey: ['quizzes', id],
        queryFn: () => quizApi.findById(id),
        enabled: !!id,
    });
}

export function useCreateQuiz() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateQuizDTO) => quizApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quizzes'] });
        },
    });
}

export function useUpdateQuiz() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateQuizDTO }) => quizApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['quizzes', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['quizzes'] });
        },
    });
}

export function useDeleteQuiz() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => quizApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['quizzes'] });
        },
    });
}

export function usePublishQuiz() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => quizApi.publish(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ['quizzes', id] });
            queryClient.invalidateQueries({ queryKey: ['quizzes'] });
        },
    });
}

export function useQuizQuestions(quizId: string) {
    return useQuery({
        queryKey: ['quizzes', quizId, 'questions'],
        queryFn: () => quizApi.getQuizQuestions(quizId),
        enabled: !!quizId,
    });
}

