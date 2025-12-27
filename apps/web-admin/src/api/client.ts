import axios, { type AxiosInstance, type AxiosError, type AxiosResponse } from 'axios';

export interface ApiClientConfig {
  baseURL?: string;
  onUnauthorized?: () => void;
}


export function createApiClient(config?: ApiClientConfig): AxiosInstance {
  const apiClient = axios.create({
    baseURL: config?.baseURL || (typeof window !== 'undefined' 
      ? ((import.meta as any).env?.VITE_API_URL || 'http://localhost:8080')
      : 'http://localhost:8080'),
    headers: {
      'Content-Type': 'application/json',
    },
    // withCredentials: true - Browser automatically sends HttpOnly cookies with requests
    // Server validates authentication from cookies, not Authorization header
    withCredentials: true,
  });

  // Response interceptor - Handle errors globally
  apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Unauthorized - redirect to login
        // Server has already cleared cookies
        if (typeof window !== 'undefined') {
          if (config?.onUnauthorized) {
            config.onUnauthorized();
          } else {
            window.location.href = '/login';
          }
        }
      }
      return Promise.reject(error);
    }
  );

  return apiClient;
}

// Default API client instance
export const apiClient = createApiClient();


