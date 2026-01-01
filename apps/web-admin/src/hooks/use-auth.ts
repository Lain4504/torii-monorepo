
import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api-client';
import { useAppDispatch } from '../store/hooks';
import { setUser, clearUser } from '../store/slices/user-slice';

interface User {
    id: string;
    email: string;
    fullName: string;
    role: string;
    status: string;
}

export const useAuth = () => {
    const [user, setUserState] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const dispatch = useAppDispatch();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await apiClient.get('/api/auth/profile');
            if (response.data.success && response.data.data?.user) {
                const userData = response.data.data.user;
                setUserState(userData);
                // Dispatch to Redux
                dispatch(setUser({
                    id: userData.id,
                    email: userData.email,
                    fullName: userData.fullName,
                    avatarUrl: null,
                    role: userData.role,
                    status: userData.status,
                    permissions: userData.permissions || [],
                }));
            } else {
                handleLogout();
            }
        } catch (error) {
            handleLogout();
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);
            const response = await apiClient.post('/api/auth/login', { email, password });

            if (response.data.success) {
                // Fetch profile after login
                const profileResponse = await apiClient.get('/api/auth/profile');
                if (profileResponse.data.success && profileResponse.data.data?.user) {
                    const userData = profileResponse.data.data.user;
                    setUserState(userData);
                    dispatch(setUser({
                        id: userData.id,
                        email: userData.email,
                        fullName: userData.fullName,
                        avatarUrl: null,
                        role: userData.role,
                        status: userData.status,
                        permissions: userData.permissions || [],
                    }));
                }
                return { success: true };
            } else {
                return {
                    success: false,
                    error: response.data.message || 'Login failed'
                };
            }
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Login failed'
            };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await apiClient.post('/api/auth/logout');
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            handleLogout();
            window.location.href = '/login';
        }
    };

    const handleLogout = () => {
        setUserState(null);
        dispatch(clearUser());
    };

    return {
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        user,
    };
};
