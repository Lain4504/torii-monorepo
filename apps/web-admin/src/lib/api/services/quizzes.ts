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
    courseId?: string;
    lessonId?: string;
    totalTime?: number;
    totalQuestions: number;
    passingScore?: number;
    maxAttempts: number;
    shuffleQuestions: boolean;
    showExplanation: boolean;
    status: string;
    sections?: any;
    createdAt: string;
    updatedAt: string;
}

export interface CreateQuizDTO {
    title: string;
    description?: string;
    quizType?: string; // default 'lesson'
    courseId?: string;
    lessonId?: string;
    totalTime?: number;
    passingScore?: number;
    maxAttempts?: number;
    shuffleQuestions?: boolean;
    showExplanation?: boolean;
    status?: string;
}

export interface UpdateQuizDTO extends Partial<CreateQuizDTO> { }

export interface QuizQueryDTO {
    page?: number;
    limit?: number;
    courseId?: string;
    lessonId?: string;
    status?: string;
    quizType?: string;
    search?: string;
}

// ============================================================================
// API
// ============================================================================

export const quizApi = {
    async findAll(params: QuizQueryDTO): Promise<PaginatedApiResponse<QuizDTO>> {
        const response = await apiClient.get<PaginatedApiResponse<QuizDTO>>('/api/exams', { params });
        return response.data;
    },

    async findById(id: string): Promise<QuizDTO> {
        const response = await apiClient.get<StandardApiResponse<{ exam: QuizDTO }>>(`/api/exams/${id}`);
        return response.data.data!.exam;
    },

    async create(data: CreateQuizDTO): Promise<QuizDTO> {
        const response = await apiClient.post<StandardApiResponse<{ exam: QuizDTO }>>('/api/exams', data);
        return response.data.data!.exam;
    },

    async update(id: string, data: UpdateQuizDTO): Promise<QuizDTO> {
        const response = await apiClient.put<StandardApiResponse<{ exam: QuizDTO }>>(`/api/exams/${id}`, data);
        return response.data.data!.exam;
    },

    async delete(id: string): Promise<boolean> {
        const response = await apiClient.delete<StandardApiResponse<boolean>>(`/api/exams/${id}`);
        return response.data.success;
    },

    async publish(id: string): Promise<QuizDTO> {
        const response = await apiClient.patch<StandardApiResponse<{ exam: QuizDTO }>>(`/api/exams/${id}/publish`, {});
        return response.data.data!.exam;
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
