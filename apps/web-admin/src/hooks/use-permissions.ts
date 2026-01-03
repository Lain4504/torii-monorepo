import { useAppSelector } from '../store/hooks';
import { selectPermissions, selectRole, selectStaffTemplate } from '../store/slices/auth-slice';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../utils/permissions';

export function usePermissions() {
    const permissions = useAppSelector(selectPermissions);
    const role = useAppSelector(selectRole);
    const staffTemplate = useAppSelector(selectStaffTemplate);

    const isAdmin = role === 'admin';

    return {
        permissions,
        role,
        staffTemplate,
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
