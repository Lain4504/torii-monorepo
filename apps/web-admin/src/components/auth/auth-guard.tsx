import { type ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks.ts';
import { selectIsAuthenticated, selectAuthLoading, setAuthenticated, setLoading, setError } from '@/store/slices/auth-slice.ts';
import { setUser } from '@/store/slices/user-slice.ts';
import { apiClient } from '@/lib/api-client.ts';

interface AuthGuardProps {
    children: ReactNode;
}

/**
 * AuthGuard wraps protected routes and ensures user is authenticated
 * Fetches user profile on mount if authenticated but Redux state is empty
 */
export function AuthGuard({ children }: AuthGuardProps) {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const isLoading = useAppSelector(selectAuthLoading);

    useEffect(() => {
        async function checkAuth() {
            try {
                dispatch(setLoading(true));

                // Try to fetch user profile (will use HTTP-only cookies)
                const response = await apiClient.get('/auth/profile');

                if (response.data.success && response.data.data) {
                    const userData = response.data.data;

                    // Block learner role from accessing web-admin
                    if (userData.role === 'learner') {
                        dispatch(setError('Learners cannot access admin panel. Please use the learner portal.'));
                        dispatch(setAuthenticated(false));
                        navigate('/login', { replace: true });
                        return;
                    }

                    // Store user data in Redux
                    dispatch(setUser({
                        id: userData.id,
                        email: userData.email,
                        fullName: userData.fullName,
                        avatarUrl: userData.avatarUrl,
                        role: userData.role,
                        permissions: userData.permissions || [],
                    }));

                    dispatch(setAuthenticated(true));
                } else {
                    // Not authenticated, redirect to login
                    navigate('/login', { replace: true });
                }
            } catch (error) {
                // Error fetching profile, redirect to login
                console.error('Auth check failed:', error);
                navigate('/login', { replace: true });
            } finally {
                dispatch(setLoading(false));
            }
        }

        if (!isAuthenticated) {
            checkAuth();
        }
    }, [isAuthenticated, dispatch, navigate]);

    // Show loading spinner while checking auth
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    // Only render children if authenticated
    return isAuthenticated ? <>{children}</> : null;
}
