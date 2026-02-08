import type { ReactNode } from 'react';
import { usePermissions } from '@/hooks/use-permissions.ts';

interface CanProps {
    /** Single permission required */
    permission?: string;
    /** Require ANY of these permissions */
    anyPermission?: string[];
    /** Require ALL of these permissions */
    allPermissions?: string[];
    /** Single role required (Strict check, bypasses admin wildcard if role doesn't match) */
    role?: string;
    /** Require ANY of these roles (Strict check, bypasses admin wildcard if role doesn't match) */
    roles?: string[];
    /** Content to render if user has permission */
    children: ReactNode;
    /** Optional fallback content if user doesn't have permission */
    fallback?: ReactNode;
}

/**
 * Permission-based conditional rendering component
 * 
 * Usage:
 * <Can permission="user.manage">
 *   <CreateUserButton />
 * </Can>
 * 
 * <Can anyPermission={['course.create', 'course.update']}>
 *   <CourseEditor />
 * </Can>
 */
export function Can({ permission, anyPermission, allPermissions, role, roles, children, fallback = null }: CanProps) {
    const { can, canAny, canAll, role: userRole } = usePermissions();

    // 1. Role Check (Strict - takes precedence even over admin wildcard)
    if (role && userRole !== role) return <>{fallback}</>;
    if (roles && !roles.includes(userRole as string)) return <>{fallback}</>;

    // 2. Permission Check
    let hasAccess = false;
    
    // If no permissions are specified but role check passed (or wasn't requested), grant access
    if (!permission && !anyPermission && !allPermissions) {
        hasAccess = true;
    } else if (permission) {
        hasAccess = can(permission);
    } else if (anyPermission) {
        hasAccess = canAny(anyPermission);
    } else if (allPermissions) {
        hasAccess = canAll(allPermissions);
    }

    return hasAccess ? <>{children}</> : <>{fallback}</>;
}

