import { type ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks.ts';
import { selectIsAuthenticated, setAuthenticated, setLoading, setError } from '@/store/slices/auth-slice.ts';
import { setUser } from '@/store/slices/user-slice.ts';
import { apiClient } from '@/lib/api-client.ts';

interface AuthGuardProps {
    children: ReactNode;
}

/**
 * AuthGuard wraps protected routes and ensures user is authenticated
 * Only verifies session if not already authenticated
 */
export function AuthGuard({ children }: AuthGuardProps) {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const [hasVerified, setHasVerified] = useState(false);

    useEffect(() => {
        async function verifySession() {
            // Skip verification if already authenticated
            if (isAuthenticated) {
                setHasVerified(true);
                return;
            }

            // Skip if already verified once
            if (hasVerified) {
                return;
            }

            try {
                dispatch(setLoading(true));

                // Try to fetch user profile (will use HTTP-only cookies)
                const response = await apiClient.get('/api/auth/profile');

                if (response.data.success && response.data.data?.user) {
                    const userData = response.data.data.user;

                    // Block learner role from accessing web-admin
                    if (userData.role === 'learner') {
                        dispatch(setError('Learners cannot access admin panel.'));
                        dispatch(setAuthenticated({ isAuthenticated: false }));
                        navigate('/login', { replace: true });
                        return;
                    }

                    // Store user data in Redux
                    dispatch(setUser({
                        id: userData.id,
                        email: userData.email,
                        fullName: userData.fullName,
                        avatarUrl: null,
                        role: userData.role,
                        status: userData.status,
                        permissions: userData.permissions || [],
                    }));

                    dispatch(setAuthenticated({
                        isAuthenticated: true,
                        user: userData
                    }));

                    setHasVerified(true);
                } else {
                    throw new Error('Session invalid');
                }
            } catch (error) {
                console.warn('Session verification failed, redirecting to login');
                dispatch(setAuthenticated({ isAuthenticated: false }));
                navigate('/login', { replace: true });
            } finally {
                dispatch(setLoading(false));
            }
        }

        verifySession();
    }, [isAuthenticated, hasVerified, dispatch, navigate]);

    // Show loading only if not authenticated and not verified yet
    if (!isAuthenticated && !hasVerified) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    return isAuthenticated ? <>{children}</> : null;
}
