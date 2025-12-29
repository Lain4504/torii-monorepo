import { useEffect, useState } from 'react';
import { apiClient } from '../lib/api-client';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            await apiClient.get('/auth/profile');
            setIsAuthenticated(true);
        } catch (error) {
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            await apiClient.post('/auth/login', { email, password });
            setIsAuthenticated(true);
            return { success: true };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.message || 'Login failed'
            };
        }
    };

    const logout = async () => {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            // Continue logout even if request fails
            console.error('Logout error:', error);
        } finally {
            setIsAuthenticated(false);
            window.location.href = '/login';
        }
    };

    return { isAuthenticated, isLoading, login, logout, checkAuth };
};
