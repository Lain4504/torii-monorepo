import { useAppSelector } from '../store/hooks';
import { selectPermissions, selectRole, selectStaffTemplate } from '../store/slices/user-slice.ts';
import { hasPermission, hasAnyPermission, hasAllPermissions } from '../utils/permissions';

export function usePermissions() {
    const permissions = useAppSelector(selectPermissions);
    const role = useAppSelector(selectRole);
    const staffTemplate = useAppSelector(selectStaffTemplate);

    return {
        permissions,
        role,
        staffTemplate,

        /**
         * Check if user has a specific permission
         */
        can: (permission: string) => hasPermission(permissions, permission),

        /**
         * Check if user has ANY of the specified permissions
         */
        canAny: (requiredPermissions: string[]) => hasAnyPermission(permissions, requiredPermissions),

        /**
         * Check if user has ALL of the specified permissions
         */
        canAll: (requiredPermissions: string[]) => hasAllPermissions(permissions, requiredPermissions),
    };
}
