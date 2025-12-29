import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { PaginatedResponse, UserResponseDTO, UserCreateDTO, UserAdminUpdateDTO } from '@workspace/schemas';

export interface FindAllUsersParams {
    page?: number;
    limit?: number;
    search?: string;
}

// ============================================================================
// API Functions
// ============================================================================

export const usersApi = {
    // GET /admin/users
    async findAll(params: FindAllUsersParams): Promise<PaginatedResponse<UserResponseDTO>> {
        const response = await apiClient.get<{ success: boolean; data: PaginatedResponse<UserResponseDTO> }>('/admin/users', { params });
        // Backend returns: AxiosResponse with data = { success: true, data: PaginatedResponse }
        // So response.data.data is the PaginatedResponse object { data: [...], total, page, limit, totalPages }
        return response.data.data;
    },

    // GET /admin/users/:id
    async findOne(id: string): Promise<UserResponseDTO> {
        const response = await apiClient.get<UserResponseDTO>(`/admin/users/${id}`);
        return response.data;
    },

    // POST /admin/users
    async create(user: UserCreateDTO): Promise<UserResponseDTO> {
        const response = await apiClient.post<UserResponseDTO>('/admin/users', user);
        return response.data;
    },

    // PATCH /admin/users/:id
    async update(id: string, user: UserAdminUpdateDTO): Promise<UserResponseDTO> {
        const response = await apiClient.patch<UserResponseDTO>(`/admin/users/${id}`, user);
        return response.data;
    },

    // DELETE /admin/users/:id
    async delete(params: { id: string; hardDelete?: boolean }): Promise<void> {
        const { id, hardDelete } = params;
        await apiClient.delete(`/admin/users/${id}`, {
            params: hardDelete !== undefined ? { hardDelete } : undefined,
        });
    },
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook: Get users list with pagination
 */
export function useUsers(params: FindAllUsersParams) {
    return useQuery({
        queryKey: ['users', params],
        queryFn: () => usersApi.findAll(params),
        staleTime: 30000,
    });
}

/**
 * Hook: Get single user by ID
 */
export function useUser(id: string) {
    return useQuery({
        queryKey: ['users', id],
        queryFn: () => usersApi.findOne(id),
        enabled: !!id,
    });
}

/**
 * Hook: Create new user
 */
export function useCreateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (user: UserCreateDTO) => usersApi.create(user),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

/**
 * Hook: Update user
 */
export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, user }: { id: string; user: UserAdminUpdateDTO }) =>
            usersApi.update(id, user),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['users', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}

/**
 * Hook: Delete user
 */
export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (params: { id: string; hardDelete?: boolean }) => usersApi.delete(params),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });
}
