import { useAppSelector } from '@/hooks/hooks.ts';
import { selectPermissions, selectRole } from '@/store/slices/auth-slice.ts';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '@/lib/utils/permissions.ts';
import { UserRole } from "@workspace/schemas";

export function usePermissions() {
    const permissions = useAppSelector(selectPermissions);
    const role = useAppSelector(selectRole);

    const isAdmin = role === UserRole.ADMIN;

    return {
        permissions,
        role,
        isAdmin,

        /**
         * Check if user has a specific permission
         */
        can: (permission: string) => isAdmin || hasPermission(permissions, permission),

        /**
         * Check if user has ANY of the specified permissions
         */
        canAny: (requiredPermissions: string[]) => isAdmin || hasAnyPermission(permissions, requiredPermissions),

        /**
         * Check if user has ALL of the specified permissions
         */
        canAll: (requiredPermissions: string[]) => isAdmin || hasAllPermissions(permissions, requiredPermissions),
    };
}

