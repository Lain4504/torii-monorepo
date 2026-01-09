import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/api-client.ts';
import type {
    PaginatedResponseDTO,
    QuestionPoolResponseDTO,
    QuestionPoolCreateDTO,
    QuestionPoolUpdateDTO,
    QuestionPoolQueryDTO,
} from '@workspace/schemas';

// ============================================================================
// API Functions
// ============================================================================

export const questionPoolsApi = {
    // GET /api/question-pools
    async findAll(params: QuestionPoolQueryDTO): Promise<PaginatedResponseDTO<QuestionPoolResponseDTO>> {
        const response = await apiClient.get<PaginatedResponseDTO<QuestionPoolResponseDTO>>('/api/question-pools', { params });
        return response.data;
    },

    // GET /api/question-pools/:id
    async findOne(id: string): Promise<QuestionPoolResponseDTO> {
        const response = await apiClient.get<QuestionPoolResponseDTO>(`/api/question-pools/${id}`);
        return response.data;
    },

    // POST /api/question-pools
    async create(pool: QuestionPoolCreateDTO): Promise<QuestionPoolResponseDTO> {
        const response = await apiClient.post<QuestionPoolResponseDTO>('/api/question-pools', pool);
        return response.data;
    },

    // PATCH /api/question-pools/:id
    async update(id: string, pool: QuestionPoolUpdateDTO): Promise<QuestionPoolResponseDTO> {
        const response = await apiClient.patch<QuestionPoolResponseDTO>(`/api/question-pools/${id}`, pool);
        return response.data;
    },

    // DELETE /api/question-pools/:id
    async delete(id: string): Promise<{ message: string }> {
        const response = await apiClient.delete<{ message: string }>(`/api/question-pools/${id}`);
        return response.data;
    },
};

// ============================================================================
// React Query Hooks
// ============================================================================

export function useQuestionPools(params: QuestionPoolQueryDTO) {
    return useQuery({
        queryKey: ['question-pools', params],
        queryFn: () => questionPoolsApi.findAll(params),
    });
}

export function useQuestionPool(id: string) {
    return useQuery({
        queryKey: ['question-pools', id],
        queryFn: () => questionPoolsApi.findOne(id),
        enabled: !!id,
    });
}

export function useCreateQuestionPool() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (pool: QuestionPoolCreateDTO) => questionPoolsApi.create(pool),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['question-pools'] });
        },
    });
}

export function useUpdateQuestionPool() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, pool }: { id: string; pool: QuestionPoolUpdateDTO }) =>
            questionPoolsApi.update(id, pool),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['question-pools', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['question-pools'] });
        },
    });
}

export function useDeleteQuestionPool() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => questionPoolsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['question-pools'] });
        },
    });
}

// Get pools by course
export function useQuestionPoolsByCourse(courseId: string) {
    return useQuery({
        queryKey: ['question-pools', 'course', courseId],
        queryFn: async () => {
            const response = await apiClient.get<QuestionPoolResponseDTO[]>(`/api/question-pools/course/${courseId}`);
            return response.data;
        },
        enabled: !!courseId,
    });
}

// Get pools by JLPT level
export function useQuestionPoolsByJlptLevel(jlptLevel: string) {
    return useQuery({
        queryKey: ['question-pools', 'jlpt', jlptLevel],
        queryFn: async () => {
            const response = await apiClient.get<QuestionPoolResponseDTO[]>(`/api/question-pools/jlpt/${jlptLevel}`);
            return response.data;
        },
        enabled: !!jlptLevel,
    });
}

