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
    // GET /question-bank
    async findAll(params: QuestionBankQueryDto): Promise<PaginatedResponseDto<QuestionBankDto>> {
        // Ensure page and limit are numbers (not strings) for backend
        const queryParams: any = {
            page: Number(params.page) || 1,
            limit: Number(params.limit) || 10,
        };
        
        // Add optional params only if they have values
        if (params.search && params.search.trim()) {
            queryParams.search = params.search.trim();
        }
        if (params.questionType) {
            queryParams.questionType = params.questionType;
        }
        if (params.jlptLevel) {
            queryParams.jlptLevel = params.jlptLevel;
        }
        if (params.difficulty) {
            queryParams.difficulty = params.difficulty;
        }
        if (params.status) {
            queryParams.status = params.status;
        }
        if (params.category && params.category.trim()) {
            queryParams.category = params.category.trim();
        }
        if (params.tags && params.tags.length > 0) {
            queryParams.tags = params.tags;
        }
        
        // Use axios params which will serialize correctly
        // Note: Query params in URL are always strings, backend needs to parse them
        const response = await apiClient.get<QuestionBankListResponseDto>('/question-bank', { 
            params: queryParams,
        });
        
        // Check if response is error
        if (!response.data.success) {
            throw new Error(response.data.message || 'Failed to fetch questions');
        }
        
        // Backend returns nested structure:
        // { success, message, error, data: { success, message, data: [...], meta: {...} } }
        // response.data = outer ApiResponseDto
        // response.data.data = inner PaginatedResponseDto (has data array and meta)
        const paginatedData = response.data.data;
        
        // Return in PaginatedResponseDto format: { data: [...], meta: {...} }
        return {
            data: paginatedData?.data || [],
            meta: paginatedData?.meta || {
                page: queryParams.page,
                limit: queryParams.limit,
                total: 0,
                totalPages: 0,
                hasNext: false,
                hasPrev: false,
            },
        };
    },

    // GET /question-bank/:id
    async findOne(id: string): Promise<QuestionBankDto> {
        const response = await apiClient.get<GetQuestionBankByIdResponseDto>(`/question-bank/${id}`);
        // Unwrap nested response
        return response.data.data;
    },

    // POST /question-bank
    async create(question: CreateQuestionBankDto): Promise<QuestionBankDto> {
        const response = await apiClient.post<CreateQuestionBankResponseDto>('/question-bank', question);
        // Unwrap nested response
        return response.data.data;
    },

    // PUT /question-bank/:id
    async update(id: string, question: UpdateQuestionBankDto): Promise<QuestionBankDto> {
        const response = await apiClient.put<UpdateQuestionBankResponseDto>(`/question-bank/${id}`, question);
        // Unwrap nested response
        return response.data.data;
    },

    // DELETE /question-bank/:id
    async delete(id: string): Promise<void> {
        await apiClient.delete(`/question-bank/${id}`);
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




