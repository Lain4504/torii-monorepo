import axios from 'axios';

export const apiClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important: sends cookies automatically
});

let isRefreshing = false;
let isRedirecting = false; // Prevent multiple simultaneous redirects
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

/**
 * Safely redirect to login page, avoiding infinite loops
 */
const redirectToLogin = () => {
    // Only run on client-side
    if (typeof window === 'undefined') {
        return;
    }

    // Prevent multiple simultaneous redirects
    if (isRedirecting) {
        return;
    }

    // Don't redirect if already on login page
    if (window.location.pathname === '/login') {
        console.log('Already on login page, skipping redirect');
        return;
    }

    isRedirecting = true;
    console.warn('Authentication failed - redirecting to login');
    window.location.href = '/login';
};

// Response interceptor - Handle 401 with automatic token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and haven't tried to refresh yet
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Avoid infinite loop: don't retry refresh endpoint itself
            if (originalRequest.url?.includes('/auth/refresh')) {
                console.warn('Token refresh failed');
                isRefreshing = false;
                processQueue(error, null);
                redirectToLogin();
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // Queue the request while refresh is in progress
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(() => {
                    return apiClient(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Try to refresh the token
                await apiClient.post('/api/auth/refresh');
                isRefreshing = false;
                processQueue(null, 'success');

                // Retry the original request
                return apiClient(originalRequest);
            } catch (refreshError) {
                isRefreshing = false;
                processQueue(refreshError, null);
                redirectToLogin();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);
