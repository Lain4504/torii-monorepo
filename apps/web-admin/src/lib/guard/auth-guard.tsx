import { type ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/hooks.ts';
import { selectIsAuthenticated, checkAuth, setError, logout } from '@/store/slices/auth-slice.ts';

interface AuthGuardProps {
    children: ReactNode;
}

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
                    // Block learner role
                    if (user.role === 'learner') {
                        dispatch(setError('Learners cannot access admin panel.'));
                        dispatch(logout()); // Clear state/cookie logic on backend? Logout thunk calls backend.
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
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return isAuthenticated ? <>{children}</> : null;
}
