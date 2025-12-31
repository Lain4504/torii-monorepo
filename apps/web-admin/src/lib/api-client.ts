import axios from 'axios';
import { auth } from './firebase-config';

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add Firebase ID token to all requests
apiClient.interceptors.request.use(
    async (config) => {
        try {
            const user = auth.currentUser;
            if (user) {
                // Get Firebase ID token (automatically refreshed by Firebase SDK)
                const token = await user.getIdToken();
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Failed to get Firebase ID token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle 401 errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        // For 401 errors, Firebase auth state listener will handle sign out
        // No need for refresh logic as Firebase handles it automatically
        if (error.response?.status === 401) {
            console.warn('Unauthorized request - user may need to re-authenticate');
            // Could trigger a sign-out here, but the auth state listener handles it
        }

        return Promise.reject(error);
    }
);
