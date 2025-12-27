import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { PaginatedResponseDto, UserResponseDto, FindAllUsersParamsDto, CreateUserDto, UpdateUserDto } from '@workspace/dtos';

// ============================================================================
// API Functions
// ============================================================================

export const usersApi = {
    // GET /admin/users
    async findAll(params: FindAllUsersParamsDto): Promise<PaginatedResponseDto<UserResponseDto>> {
        const response = await apiClient.get<PaginatedResponseDto<UserResponseDto>>('/admin/users', { params });
        return response.data;
    },

    // GET /admin/users/:id
    async findOne(id: string): Promise<UserResponseDto> {
        const response = await apiClient.get<UserResponseDto>(`/admin/users/${id}`);
        return response.data;
    },

    // POST /admin/users
    async create(user: CreateUserDto): Promise<UserResponseDto> {
        const response = await apiClient.post<UserResponseDto>('/admin/users', user);
        return response.data;
    },

    // PATCH /admin/users/:id
    async update(id: string, user: UpdateUserDto): Promise<UserResponseDto> {
        const response = await apiClient.patch<UserResponseDto>(`/admin/users/${id}`, user);
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
export function useUsers(params: FindAllUsersParamsDto) {
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
        mutationFn: (user: CreateUserDto) => usersApi.create(user),
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
        mutationFn: ({ id, user }: { id: string; user: UpdateUserDto }) =>
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
