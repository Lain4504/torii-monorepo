import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosError, type AxiosResponse } from 'axios';
import { getCookie, removeCookie } from '../utils/cookies';

export interface ApiClientConfig {
  baseURL?: string;
  onUnauthorized?: () => void;
}

/**
 * Create an API client with authentication interceptors
 */
export function createApiClient(config?: ApiClientConfig): AxiosInstance {
  const apiClient = axios.create({
    baseURL: config?.baseURL || (typeof window !== 'undefined' 
      ? ((import.meta as any).env?.VITE_API_URL || 'http://localhost:8080')
      : 'http://localhost:8080'),
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: true, // For cookies/sessions
  });

  // Request interceptor - Add auth token
  apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      if (typeof window !== 'undefined') {
        const token = getCookie('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error: AxiosError) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - Handle errors globally
  apiClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        // Remove token and redirect to login
        if (typeof window !== 'undefined') {
          removeCookie('access_token');
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

