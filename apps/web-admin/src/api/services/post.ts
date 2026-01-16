import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/api-client.ts';
import type {
    PostResponseDTO,
    PostCreateDTO,
    PostUpdateDTO,
    PostQueryDTO,
    StandardApiResponse,
    PaginatedApiResponse,
} from '@workspace/schemas';

// ============================================================================
// API Functions
// ============================================================================

export const postApi = {
    // GET /api/posts
    async findAll(params: PostQueryDTO): Promise<PaginatedApiResponse<PostResponseDTO>> {
        const response = await apiClient.get<PaginatedApiResponse<PostResponseDTO>>('/api/posts', { params });
        return response.data;
    },

    // GET /api/posts/:id
    async findOne(id: string): Promise<PostResponseDTO> {
        const response = await apiClient.get<StandardApiResponse<{ post: PostResponseDTO }>>(`/api/posts/${id}`);
        return response.data.data!.post;
    },

    // POST /api/posts
    async create(post: PostCreateDTO): Promise<PostResponseDTO> {
        const response = await apiClient.post<StandardApiResponse<{ post: PostResponseDTO }>>('/api/posts', post);
        return response.data.data!.post;
    },

    // PATCH /api/posts/:id
    async update(id: string, post: PostUpdateDTO): Promise<PostResponseDTO> {
        const response = await apiClient.patch<StandardApiResponse<{ post: PostResponseDTO }>>(`/api/posts/${id}`, post);
        return response.data.data!.post;
    },

    // DELETE /api/posts/:id
    async delete(id: string): Promise<{ success: boolean }> {
        const response = await apiClient.delete<StandardApiResponse<{ success: boolean }>>(`/api/posts/${id}`);
        return response.data.data!;
    },
};

// ============================================================================
// React Query Hooks
// ============================================================================

export function usePosts(params: PostQueryDTO) {
    return useQuery({
        queryKey: ['posts', params],
        queryFn: () => postApi.findAll(params),
    });
}

export function usePost(id: string) {
    return useQuery({
        queryKey: ['posts', id],
        queryFn: () => postApi.findOne(id),
        enabled: !!id,
    });
}

export function useCreatePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (post: PostCreateDTO) => postApi.create(post),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
    });
}

export function useUpdatePost(id: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (post: PostUpdateDTO) => postApi.update(id, post),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
            queryClient.invalidateQueries({ queryKey: ['posts', id] });
        },
    });
}

export function useDeletePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => postApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['posts'] });
        },
    });
}
