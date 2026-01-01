import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
    PaginatedResponse,
    QuestionBankResponseDTO,
    QuestionBankCreateDTO,
    QuestionBankUpdateDTO,
    QuestionBankQueryDTO,
} from '@workspace/schemas';

export interface QuestionBankFilters {
    search: string;
    questionType: string;
    jlptLevel: string;
    difficulty: string;
    status: string;
    category: string;
}


// ============================================================================
// API Functions
// ============================================================================

export const questionBankApi = {
    // GET /api/question-banks
    async findAll(params: QuestionBankQueryDTO): Promise<PaginatedResponse<QuestionBankResponseDTO>> {
        const response = await apiClient.get<PaginatedResponse<QuestionBankResponseDTO>>('/api/question-banks', { params });
        return response.data;
    },

    // GET /api/question-banks/:id
    async findOne(id: string): Promise<QuestionBankResponseDTO> {
        const response = await apiClient.get<QuestionBankResponseDTO>(`/api/question-banks/${id}`);
        // Unwrap nested response
        return response.data;
    },

    // POST /api/question-banks
    async create(question: QuestionBankCreateDTO): Promise<QuestionBankResponseDTO> {
        const response = await apiClient.post<QuestionBankResponseDTO>('/api/question-banks', question);
        // Unwrap nested response
        return response.data;
    },

    // PUT /api/question-banks/:id
    async update(id: string, question: QuestionBankUpdateDTO): Promise<QuestionBankResponseDTO> {
        const response = await apiClient.put<QuestionBankResponseDTO>(`/api/question-banks/${id}`, question);
        // Unwrap nested response
        return response.data;
    },

    // DELETE /api/question-banks/:id
    async delete(id: string): Promise<void> {
        await apiClient.delete(`/api/question-banks/${id}`);
    },
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook: Get question banks list with pagination and filters
 */
/**
 * Hook: Get question banks list with pagination and filters
 */
export function useQuestionBanks(params: QuestionBankQueryDTO) {
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
        mutationFn: (question: QuestionBankCreateDTO) => questionBankApi.create(question),
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
        mutationFn: ({ id, question }: { id: string; question: QuestionBankUpdateDTO }) =>
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




