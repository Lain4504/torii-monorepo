import { type ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks.ts';
import { selectIsAuthenticated, checkAuth, setError, logout } from '@/store/slices/auth-slice.ts';
import { PageLoading } from '@workspace/ui/components/page-loading';

interface AuthGuardProps {
    children: ReactNode;
}

const ADMIN_PANEL_ENTRY_PERMISSIONS = [
    "ops.user.view",
    "ops.user.manage",
    "lms.catalog.read",
    "lms.catalog.create",
    "lms.catalog.update",
    "lms.catalog.approve",
    "lms.delivery.read",
    "lms.delivery.create",
    "lms.delivery.update",
    "lms.delivery.approve",
    "lms.assessment.read",
    "lms.assessment.create",
    "lms.assessment.update",
    "lms.assessment.grade",
    "lms.commerce.read",
    "lms.commerce.create",
    "lms.commerce.update",
    "lms.commerce.approve",
    "ops.order.manage",
    "ops.coupon.manage",
    "ops.subscription.manage",
    "ops.support.view",
    "ops.support.handle",
    "ops.audit.view",
    "ops.report.view",
    "ops.blog.manage",
    "ops.gamification.manage",
];

/**
 * AuthGuard wraps protected routes and ensures user is authenticated
 */
export function AuthGuard({ children }: AuthGuardProps) {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const [hasVerified, setHasVerified] = useState(false);

    useEffect(() => {
        const verifySession = async () => {
            if (isAuthenticated) {
                setHasVerified(true);
                return;
            }

            if (hasVerified) return;

            try {
                // Dispatch checkAuth thunk
                const user = await dispatch(checkAuth()).unwrap();

                if (user) {
                    const permissions = (user.permissions || []) as string[];
                    const canEnter =
                        permissions.some((p) => ADMIN_PANEL_ENTRY_PERMISSIONS.includes(p));
                    if (!canEnter) {
                        dispatch(setError('Bạn không có quyền truy cập trang quản trị.'));
                        dispatch(logout());
                        navigate('/login', { replace: true });
                        return;
                    }
                    setHasVerified(true);
                }
            } catch (error) {
                // Not authenticated
                navigate('/login', { replace: true });
            }
        };

        verifySession();
    }, [isAuthenticated, hasVerified, dispatch, navigate]);

    if (!isAuthenticated && !hasVerified) {
        return (
            <PageLoading className="h-screen" />
        );
    }

    return isAuthenticated ? <>{children}</> : null;
}
