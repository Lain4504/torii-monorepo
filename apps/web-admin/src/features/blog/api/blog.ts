import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
    PaginatedResponse,
    BlogPostResponseDTO,
    BlogPostCreateDTO,
    BlogPostUpdateDTO,
    BlogPostQueryDTO,
} from '@workspace/schemas';

// ============================================================================
// API Functions
// ============================================================================

export const blogApi = {
    // GET /api/v1/admin/blogs
    async findAll(params: BlogPostQueryDTO): Promise<PaginatedResponse<BlogPostResponseDTO>> {
        const response = await apiClient.get<PaginatedResponse<BlogPostResponseDTO>>('/api/v1/admin/blogs', { params });
        return response.data;
    },

    // GET /api/v1/admin/blogs/:id
    async findOne(id: string): Promise<BlogPostResponseDTO> {
        const response = await apiClient.get<BlogPostResponseDTO>(`/api/v1/admin/blogs/${id}`);
        return response.data;
    },

    // POST /api/v1/admin/blogs
    async create(blog: BlogPostCreateDTO): Promise<BlogPostResponseDTO> {
        const response = await apiClient.post<BlogPostResponseDTO>('/api/v1/admin/blogs', blog);
        return response.data;
    },

    // PATCH /api/v1/admin/blogs/:id
    async update(id: string, blog: BlogPostUpdateDTO): Promise<BlogPostResponseDTO> {
        const response = await apiClient.patch<BlogPostResponseDTO>(`/api/v1/admin/blogs/${id}`, blog);
        return response.data;
    },

    // DELETE /api/v1/admin/blogs/:id
    async delete(id: string): Promise<void> {
        await apiClient.delete(`/api/v1/admin/blogs/${id}`);
    },
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook: Get blog posts list with pagination and filters
 */
export function useBlogs(params: BlogPostQueryDTO) {
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
        mutationFn: (blog: BlogPostCreateDTO) => blogApi.create(blog),
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
        mutationFn: ({ id, blog }: { id: string; blog: BlogPostUpdateDTO }) =>
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


