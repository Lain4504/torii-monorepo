import axios from 'axios';

export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for Cookies
});

// State for refresh token process
let isRefreshing = false;
let isRedirecting = false; // Prevent multiple simultaneous redirects
let failedRequestsQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (error?: unknown) => void;
}> = [];

/**
 * Process all queued requests after token refresh
 * @param error If provided, reject all queued requests
 */
const processQueue = (error: unknown = null) => {
    failedRequestsQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });
    failedRequestsQueue = [];
};

/**
 * Safely redirect to login page, avoiding infinite loops
 * Clears server-side auth state (cookies) before redirecting
 */
const redirectToLogin = async () => {
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

    try {
        // Call logout to clear server-side cookies
        // Web-admin uses ONLY cookies for auth (no localStorage)
        // Keep localStorage for user preferences (theme, sidebar)
        await apiClient.post('/api/auth/logout').catch(() => {
            // Ignore errors - we're logging out anyway
        });
    } catch (e) {
        // Ignore - continue with redirect
    }

    window.location.href = '/login';
};

// Response interceptor - Handle 401 errors with automatic token refresh
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check if error is 401 and we haven't already retried this request
        if (error.response?.status === 401 && !originalRequest._retry) {

            // Avoid infinite loop: don't retry refresh endpoint itself
            if (originalRequest.url?.includes('/auth/refresh')) {
                console.warn('Token refresh failed');
                isRefreshing = false;
                processQueue(error);
                redirectToLogin();
                return Promise.reject(error);
            }

            // If a refresh is already in progress, queue this request
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedRequestsQueue.push({ resolve, reject });
                })
                    .then(() => {
                        // Retry original request after refresh completes
                        return apiClient(originalRequest);
                    })
                    .catch(err => {
                        return Promise.reject(err);
                    });
            }

            // Mark request as retried to prevent infinite loops
            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // Attempt to refresh tokens
                console.log('Access token expired, refreshing...');
                await apiClient.post('/api/auth/refresh');

                // Refresh successful
                console.log('Token refreshed successfully');
                processQueue(); // Resolve all queued requests
                isRefreshing = false;

                // Retry the original request
                return apiClient(originalRequest);
            } catch (refreshError) {
                // Refresh failed - clear queue and redirect to login
                console.error('Token refresh failed:', refreshError);
                processQueue(refreshError);
                isRefreshing = false;
                redirectToLogin();
                return Promise.reject(refreshError);
            }
        }

        // For other status codes or if not 401, pass through
        return Promise.reject(error);
    }
);
