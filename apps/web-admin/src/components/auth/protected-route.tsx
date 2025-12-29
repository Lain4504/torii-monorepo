import type {ReactNode} from 'react';
import { Navigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/use-permissions.ts';

interface ProtectedRouteProps {
    /** Single permission required to access this route */
    requiredPermission?: string;
    /** Require ANY of these permissions */
    anyPermission?: string[];
    /** Require ALL of these permissions */
    allPermissions?: string[];
    /** Content to render if authorized */
    children: ReactNode;
    /** Where to redirect if unauthorized (default: /forbidden) */
    redirectTo?: string;
}

/**
 * Route-level permission guard
 * 
 * Usage:
 * <Route path="users" element={
 *   <ProtectedRoute requiredPermission="user.view">
 *     <UsersPage />
 *   </ProtectedRoute>
 * } />
 */
export function ProtectedRoute({
    requiredPermission,
    anyPermission,
    allPermissions,
    children,
    redirectTo = '/forbidden',
}: ProtectedRouteProps) {
    const { can, canAny, canAll } = usePermissions();

    let hasAccess = true;

    if (requiredPermission) {
        hasAccess = can(requiredPermission);
    } else if (anyPermission) {
        hasAccess = canAny(anyPermission);
    } else if (allPermissions) {
        hasAccess = canAll(allPermissions);
    }

    if (!hasAccess) {
        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
}
