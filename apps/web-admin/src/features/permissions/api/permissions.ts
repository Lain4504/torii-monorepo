import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
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
        const res = await apiClient.get('/api/rbac/roles');
        return res.data.data as RoleDefinition[];
    },

    async getPermissions() {
        const res = await apiClient.get('/api/rbac/permissions');
        return res.data.data as PermissionsResponse;
    },

    async getRolePermissions(roleCode: string) {
        const res = await apiClient.get(`/api/rbac/roles/${roleCode}/permissions`);
        return res.data.data.permissions as string[];
    },

    async updateRolePermissions(roleCode: string, permissions: string[]) {
        const res = await apiClient.put(`/api/rbac/roles/${roleCode}/permissions`, {
            permissions,
        });
        return res.data;
    },

    async reseed() {
        const res = await apiClient.post('/api/rbac/reseed');
        return res.data;
    },
};

// React Query hooks
export function useRoles() {
    return useQuery({
        queryKey: ['rbac', 'roles'],
        queryFn: () => permissionsApi.getRoles(),
    });
}

export function usePermissions() {
    return useQuery({
        queryKey: ['rbac', 'permissions'],
        queryFn: () => permissionsApi.getPermissions(),
    });
}

export function useRolePermissions(roleCode: string | null) {
    return useQuery({
        queryKey: ['rbac', 'role-permissions', roleCode],
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
                queryKey: ['rbac', 'role-permissions', variables.roleCode],
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
            queryClient.invalidateQueries({ queryKey: ['rbac'] });
            toast.success('Permissions re-seeded successfully');
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Failed to re-seed permissions');
        },
    });
}
