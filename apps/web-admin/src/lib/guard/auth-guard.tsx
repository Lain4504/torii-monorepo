import { type ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks.ts';
import { selectIsAuthenticated, checkAuth, setError, logout } from '@/store/slices/auth-slice.ts';
import { PageLoading } from '@workspace/ui/components/page-loading';

interface AuthGuardProps {
    children: ReactNode;
}

const ADMIN_PANEL_ENTRY_PERMISSIONS = [
    "user.view",
    "user.manage",
    "academy.content.write",
    "academy.delivery.write",
    "academy.delivery.approve",
    "academy.content.approve",
    "academy.commerce.write",
    "academy.commerce.approve",
    "academy:order:admin",
    "academy:coupon:admin",
    "academy:subscription:admin",
    "support.view",
    "support.handle",
    "audit.view",
    "report.view",
    "blog.manage",
    "blog.create",
    "blog.update",
    "blog.publish",
    "blog.delete",
    "blog.view_restricted",
    "gamification.manage",
    "exam.manage",
    "submission.grade",
    "schedule.view",
    "live_class.manage",
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
                        permissions.includes('*') ||
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
