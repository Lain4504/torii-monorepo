import { apiClient } from './client';
import { setCookie, removeCookie } from '@workspace/ui/utils/cookies';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  user?: {
    id: string;
    email: string;
    fullName?: string;
  };
  session?: {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };
  error?: string;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    const data = response.data;
    
    if (data.session?.access_token) {
      // Set cookie with 7 days expiration (or use expires_in from server if available)
      const expiresInDays = data.session.expires_in 
        ? Math.floor(data.session.expires_in / (24 * 60 * 60))
        : 7;
      setCookie('access_token', data.session.access_token, expiresInDays);
    }
    
    return data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      const result = response.data;
      
      if (result.session?.access_token) {
        // Set cookie with 7 days expiration (or use expires_in from server if available)
        const expiresInDays = result.session.expires_in 
          ? Math.floor(result.session.expires_in / (24 * 60 * 60))
          : 7;
        setCookie('access_token', result.session.access_token, expiresInDays);
      }
      
      return result;
    } catch (error: any) {
      // Extract error message from various error response formats
      // Handle different error structures from server
      let errorMessage = 'Đăng ký thất bại';
      
      if (error?.response?.data) {
        // NestJS error format: { status: 'error', message: '...', error: '...' }
        errorMessage = 
          error.response.data.message || 
          error.response.data.error || 
          errorMessage;
      } else if (error?.message) {
        // Direct error message
        errorMessage = error.message;
      }
      
      // Create a new error with the extracted message
      const customError = new Error(errorMessage);
      // Attach response data for Redux to access
      (customError as any).response = error?.response;
      throw customError;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      removeCookie('access_token');
    }
  },
};

