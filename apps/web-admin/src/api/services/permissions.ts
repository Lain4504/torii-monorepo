import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/api-client.ts';
import { toast } from '@workspace/ui/components/sonner';

// Types
export interface RoleDefinition {
    code: string;
    name: string;
    description: string;
    extends?: string;
}

export interface PermissionDefinition {
    code: string;
    description: string;
    category: string;
}

export interface PermissionsResponse {
    all: PermissionDefinition[];
    byCategory: Record<string, PermissionDefinition[]>;
}

// API calls
const permissionsApi = {
    async getRoles() {
        const res = await apiClient.get('/api/authorization/roles');
        return res.data.data as RoleDefinition[];
    },

    async getPermissions() {
        const res = await apiClient.get('/api/authorization/permissions');
        return res.data.data as PermissionsResponse;
    },

    async getRolePermissions(roleCode: string) {
        const res = await apiClient.get(`/api/authorization/roles/${roleCode}/permissions`);
        return res.data.data.permissions as string[];
    },

    async updateRolePermissions(roleCode: string, permissions: string[]) {
        const res = await apiClient.put(`/api/authorization/roles/${roleCode}/permissions`, {
            permissions,
        });
        return res.data;
    },

    async reseed() {
        const res = await apiClient.post('/api/authorization/reseed');
        return res.data;
    },
};

// React Query hooks
export function useRoles() {
    return useQuery({
        queryKey: ['authorization', 'roles'],
        queryFn: () => permissionsApi.getRoles(),
    });
}

export function useFetchPermissions() {
    return useQuery({
        queryKey: ['authorization', 'permissions'],
        queryFn: () => permissionsApi.getPermissions(),
    });
}

export function useRolePermissions(roleCode: string | null) {
    return useQuery({
        queryKey: ['authorization', 'role-permissions', roleCode],
        queryFn: () => permissionsApi.getRolePermissions(roleCode!),
        enabled: !!roleCode,
    });
}

export function useUpdateRolePermissions() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            roleCode,
            permissions,
        }: {
            roleCode: string;
            permissions: string[];
        }) => permissionsApi.updateRolePermissions(roleCode, permissions),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({
                queryKey: ['authorization', 'role-permissions', variables.roleCode],
            });
            toast.success('Permissions updated successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to update permissions');
        },
    });
}

export function useReseedPermissions() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => permissionsApi.reseed(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['authorization'] });
            toast.success('Permissions re-seeded successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to re-seed permissions');
        },
    });
}
