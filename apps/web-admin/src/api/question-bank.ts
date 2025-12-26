import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import {
    PaginatedResponseDto,
    QuestionBankDto,
    CreateQuestionBankDto,
    UpdateQuestionBankDto,
    QuestionBankQueryDto,
    QuestionBankListResponseDto,
    GetQuestionBankByIdResponseDto,
    CreateQuestionBankResponseDto,
    UpdateQuestionBankResponseDto,
} from '@workspace/dtos';

// ============================================================================
// API Functions
// ============================================================================

export const questionBankApi = {
    // GET /api/question-bank
    async findAll(params: QuestionBankQueryDto): Promise<PaginatedResponseDto<QuestionBankDto>> {
        const response = await apiClient.get<QuestionBankListResponseDto>('/api/question-bank', { params });
        return response.data.data;
    },

    // GET /api/question-bank/:id
    async findOne(id: string): Promise<QuestionBankDto> {
        const response = await apiClient.get<GetQuestionBankByIdResponseDto>(`/api/question-bank/${id}`);
        // Unwrap nested response
        return response.data.data;
    },

    // POST /api/question-bank
    async create(question: CreateQuestionBankDto): Promise<QuestionBankDto> {
        const response = await apiClient.post<CreateQuestionBankResponseDto>('/api/question-bank', question);
        // Unwrap nested response
        return response.data.data;
    },

    // PUT /api/question-bank/:id
    async update(id: string, question: UpdateQuestionBankDto): Promise<QuestionBankDto> {
        const response = await apiClient.put<UpdateQuestionBankResponseDto>(`/api/question-bank/${id}`, question);
        // Unwrap nested response
        return response.data.data;
    },

    // DELETE /api/question-bank/:id
    async delete(id: string): Promise<void> {
        await apiClient.delete(`/api/question-bank/${id}`);
    },
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook: Get question banks list with pagination and filters
 */
export function useQuestionBanks(params: QuestionBankQueryDto) {
    return useQuery({
        queryKey: ['question-banks', params],
        queryFn: () => questionBankApi.findAll(params),
        staleTime: 0, // Always refetch when invalidated
    });
}

/**
 * Hook: Get single question bank by ID
 */
export function useQuestionBank(id: string) {
    return useQuery({
        queryKey: ['question-banks', id],
        queryFn: () => questionBankApi.findOne(id),
        enabled: !!id,
    });
}

/**
 * Hook: Create new question bank
 */
export function useCreateQuestionBank() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (question: CreateQuestionBankDto) => questionBankApi.create(question),
        onSuccess: () => {
            // Invalidate all question-banks queries to refetch
            queryClient.invalidateQueries({ queryKey: ['question-banks'] });
        },
    });
}

/**
 * Hook: Update question bank
 */
export function useUpdateQuestionBank() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, question }: { id: string; question: UpdateQuestionBankDto }) =>
            questionBankApi.update(id, question),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['question-banks', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['question-banks'] });
        },
    });
}

/**
 * Hook: Delete question bank
 */
export function useDeleteQuestionBank() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => questionBankApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['question-banks'] });
        },
    });
}




