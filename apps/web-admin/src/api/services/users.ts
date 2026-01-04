import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/api-client.ts';
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
    // GET /api/admin/users
    async findAll(params: FindAllUsersParams): Promise<PaginatedResponse<UserResponseDTO>> {
        const response = await apiClient.get<PaginatedResponse<UserResponseDTO>>('/api/admin/users', { params });
        // Backend returns PaginatedResponse directly
        return response.data;
    },

    // GET /api/admin/users/:id
    async findOne(id: string): Promise<UserResponseDTO> {
        const response = await apiClient.get<UserResponseDTO>(`/api/admin/users/${id}`);
        return response.data;
    },

    // POST /api/admin/users
    async create(user: UserCreateDTO): Promise<UserResponseDTO> {
        const response = await apiClient.post<UserResponseDTO>('/api/admin/users', user);
        return response.data;
    },

    // PATCH /api/admin/users/:id
    async update(id: string, user: UserAdminUpdateDTO): Promise<UserResponseDTO> {
        const response = await apiClient.patch<UserResponseDTO>(`/api/admin/users/${id}`, user);
        return response.data;
    },

    // DELETE /api/admin/users/:id
    async delete(params: { id: string; hardDelete?: boolean }): Promise<void> {
        const { id, hardDelete } = params;
        await apiClient.delete(`/api/admin/users/${id}`, {
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
