import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/api-client.ts';
import type {
    PaginatedResponseDTO,
    PostResponseDTO,
    PostCreateDTO,
    PostUpdateDTO,
    PostQueryDTO,
} from '@workspace/schemas';

// ============================================================================
// API Functions
// ============================================================================

export const blogApi = {
    // GET /api/posts
    async findAll(params: PostQueryDTO): Promise<PaginatedResponseDTO<PostResponseDTO>> {
        const response = await apiClient.get<PaginatedResponseDTO<PostResponseDTO>>('/api/posts', { params });
        return response.data;
    },

    // GET /api/posts/:id
    async findOne(id: string): Promise<PostResponseDTO> {
        const response = await apiClient.get<PostResponseDTO>(`/api/posts/${id}`);
        return response.data;
    },

    // POST /api/posts
    async create(blog: PostCreateDTO): Promise<PostResponseDTO> {
        const response = await apiClient.post<PostResponseDTO>('/api/posts', blog);
        return response.data;
    },

    // PATCH /api/posts/:id
    async update(id: string, blog: PostUpdateDTO): Promise<PostResponseDTO> {
        const response = await apiClient.patch<PostResponseDTO>(`/api/posts/${id}`, blog);
        return response.data;
    },

    // DELETE /api/posts/:id
    async delete(id: string): Promise<void> {
        await apiClient.delete(`/api/posts/${id}`);
    },
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook: Get blog posts list with pagination and filters
 */
export function useBlogs(params: PostQueryDTO) {
    return useQuery({
        queryKey: ['blogs', params],
        queryFn: () => blogApi.findAll(params),
        staleTime: 30000,
    });
}

/**
 * Hook: Get single blog post by ID
 */
export function useBlog(id: string) {
    return useQuery({
        queryKey: ['blogs', id],
        queryFn: () => blogApi.findOne(id),
        enabled: !!id,
    });
}

/**
 * Hook: Create new blog post
 */
export function useCreateBlog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (blog: PostCreateDTO) => blogApi.create(blog),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
        },
    });
}

/**
 * Hook: Update blog post
 */
export function useUpdateBlog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, blog }: { id: string; blog: PostUpdateDTO }) =>
            blogApi.update(id, blog),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['blogs', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
        },
    });
}

/**
 * Hook: Delete blog post
 */
export function useDeleteBlog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => blogApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['blogs'] });
        },
    });
}




