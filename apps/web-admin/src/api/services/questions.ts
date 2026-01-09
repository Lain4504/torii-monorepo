import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/api-client.ts';
import type {
    PaginatedResponseDTO,
    QuestionResponseDTO,
    QuestionCreateDTO,
    QuestionUpdateDTO,
    QuestionQueryDTO,
} from '@workspace/schemas';

// ============================================================================
// API Functions
// ============================================================================

export const questionsApi = {
    // GET /api/questions
    async findAll(params: QuestionQueryDTO): Promise<PaginatedResponseDTO<QuestionResponseDTO>> {
        const response = await apiClient.get<PaginatedResponseDTO<QuestionResponseDTO>>('/api/questions', { params });
        return response.data;
    },

    // GET /api/questions/:id
    async findOne(id: string): Promise<QuestionResponseDTO> {
        const response = await apiClient.get<QuestionResponseDTO>(`/api/questions/${id}`);
        return response.data;
    },

    // POST /api/questions
    async create(question: QuestionCreateDTO): Promise<QuestionResponseDTO> {
        const response = await apiClient.post<QuestionResponseDTO>('/api/questions', question);
        return response.data;
    },

    // POST /api/questions/bulk
    async createMany(questions: QuestionCreateDTO[]): Promise<{ count: number; created: QuestionResponseDTO[] }> {
        const response = await apiClient.post<{ count: number; created: QuestionResponseDTO[] }>('/api/questions/bulk', questions);
        return response.data;
    },

    // PATCH /api/questions/:id
    async update(id: string, question: QuestionUpdateDTO): Promise<QuestionResponseDTO> {
        const response = await apiClient.patch<QuestionResponseDTO>(`/api/questions/${id}`, question);
        return response.data;
    },

    // PATCH /api/questions/bulk/update
    async updateMany(questionIds: string[], data: QuestionUpdateDTO): Promise<{ count: number }> {
        const response = await apiClient.patch<{ count: number }>('/api/questions/bulk/update', { questionIds, data });
        return response.data;
    },

    // DELETE /api/questions/:id
    async delete(id: string): Promise<{ message: string }> {
        const response = await apiClient.delete<{ message: string }>(`/api/questions/${id}`);
        return response.data;
    },

    // DELETE /api/questions/bulk/delete
    async deleteMany(questionIds: string[]): Promise<{ count: number }> {
        const response = await apiClient.delete<{ count: number }>('/api/questions/bulk/delete', {
            data: { questionIds },
        });
        return response.data;
    },

    // POST /api/questions/:id/approve
    async approve(id: string): Promise<QuestionResponseDTO> {
        const response = await apiClient.post<QuestionResponseDTO>(`/api/questions/${id}/approve`);
        return response.data;
    },

    // POST /api/questions/:id/deactivate
    async deactivate(id: string): Promise<QuestionResponseDTO> {
        const response = await apiClient.post<QuestionResponseDTO>(`/api/questions/${id}/deactivate`);
        return response.data;
    },

    // POST /api/questions/:id/reject
    async reject(id: string): Promise<QuestionResponseDTO> {
        const response = await apiClient.post<QuestionResponseDTO>(`/api/questions/${id}/reject`);
        return response.data;
    },

    // POST /api/questions/:id/review
    async sendForReview(id: string): Promise<QuestionResponseDTO> {
        const response = await apiClient.post<QuestionResponseDTO>(`/api/questions/${id}/review`);
        return response.data;
    },

    // GET /api/questions/pool/:poolId
    async getByPool(poolId: string): Promise<QuestionResponseDTO[]> {
        const response = await apiClient.get<QuestionResponseDTO[]>(`/api/questions/pool/${poolId}`);
        return response.data;
    },
};

// ============================================================================
// React Query Hooks
// ============================================================================

export function useQuestions(params: QuestionQueryDTO) {
    return useQuery({
        queryKey: ['questions', params],
        queryFn: () => questionsApi.findAll(params),
    });
}

export function useQuestion(id: string) {
    return useQuery({
        queryKey: ['questions', id],
        queryFn: () => questionsApi.findOne(id),
        enabled: !!id,
    });
}

export function useCreateQuestion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (question: QuestionCreateDTO) => questionsApi.create(question),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['questions'] });
        },
    });
}

export function useCreateQuestionsBulk() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (questions: QuestionCreateDTO[]) => questionsApi.createMany(questions),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['questions'] });
        },
    });
}

export function useUpdateQuestion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, question }: { id: string; question: QuestionUpdateDTO }) =>
            questionsApi.update(id, question),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['questions', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['questions'] });
        },
    });
}

export function useDeleteQuestion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => questionsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['questions'] });
        },
    });
}

export function useApproveQuestion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => questionsApi.approve(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['questions'] });
        },
    });
}

export function useDeactivateQuestion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => questionsApi.deactivate(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['questions'] });
        },
    });
}

export function useRejectQuestion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => questionsApi.reject(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['questions'] });
        },
    });
}

export function useSendForReviewQuestion() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => questionsApi.sendForReview(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['questions'] });
        },
    });
}

// Get questions by pool
export function useQuestionsByPool(poolId: string) {
    return useQuery({
        queryKey: ['questions', 'pool', poolId],
        queryFn: async () => {
            const response = await apiClient.get<QuestionResponseDTO[]>(`/api/questions/pool/${poolId}`);
            return response.data;
        },
        enabled: !!poolId,
    });
}

