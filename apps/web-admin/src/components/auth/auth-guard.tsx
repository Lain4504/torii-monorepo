import { type ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks.ts';
import { selectIsAuthenticated, selectAuthLoading, setAuthenticated, setLoading, setError } from '@/store/slices/auth-slice.ts';
import { setUser } from '@/store/slices/user-slice.ts';
import { apiClient } from '@/lib/api-client.ts';
import { auth } from '@/lib/firebase-config';
import { onAuthStateChanged } from 'firebase/auth';

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
    // @ts-ignore
    const [firebaseInitialized, setFirebaseInitialized] = useState(false);

    useEffect(() => {
        // Listen to Firebase Auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setFirebaseInitialized(true);

            if (!firebaseUser) {
                // No Firebase user, redirect to login
                dispatch(setLoading(false));
                navigate('/login', { replace: true });
                return;
            }

            // Firebase user exists, but check if we need to fetch profile
            if (!isAuthenticated) {
                try {
                    dispatch(setLoading(true));

                    // Firebase user is authenticated, fetch profile from backend
                    const response = await apiClient.get('/api/auth/profile');

                    if (response.data.success && response.data.data) {
                        const userData = response.data.data.user;

                        // Block learner role from accessing web-admin
                        if (userData.role === 'learner') {
                            dispatch(setError('Learners cannot access admin panel. Please use the learner portal.'));
                            dispatch(setAuthenticated({
                                isAuthenticated: false,
                            }));
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
                            status: userData.status || 'active',
                            permissions: userData.permissions || [],
                        }));

                        dispatch(setAuthenticated({
                            isAuthenticated: true,
                            user: {
                                id: userData.id,
                                email: userData.email,
                                fullName: userData.fullName,
                                role: userData.role,
                                status: userData.status || 'active',
                            }
                        }));
                    } else {
                        navigate('/login', { replace: true });
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                    navigate('/login', { replace: true });
                } finally {
                    dispatch(setLoading(false));
                }
            }
        });

        return () => unsubscribe();
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
