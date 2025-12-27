import { apiClient } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export type UserRole = 'learner' | 'lecturer' | 'staff' | 'admin';

export interface AuthResponse {
  user?: {
    id: string;
    email: string;
    fullName?: string;
    role?: UserRole;
  };
  session?: {
    access_token?: string; // Server sets HttpOnly cookie, this is just for reference
    refresh_token?: string;
    expires_in?: number;
  };
  error?: string;
}

/**
 * Authentication API
 * Note: Server sets HttpOnly cookies for security (access_token, refresh_token)
 * Frontend does NOT handle tokens directly to prevent XSS attacks
 */
export const authApi = {
  /**
   * Login - Server will set HttpOnly cookies with tokens
   */
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
    // Server sets HttpOnly cookies automatically, browser will send them in subsequent requests
    return response.data;
  },

  /**
   * Register - Server will set HttpOnly cookies with tokens
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', data);
      // Server sets HttpOnly cookies automatically
      return response.data;
    } catch (error: any) {
      // Extract error message from various error response formats
      let errorMessage = 'Đăng ký thất bại';
      
      if (error?.response?.data) {
        // NestJS error format: { status: 'error', message: '...', error: '...' }
        errorMessage = 
          error.response.data.message || 
          error.response.data.error || 
          errorMessage;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      const customError = new Error(errorMessage);
      (customError as any).response = error?.response;
      throw customError;
    }
  },

  /**
   * Logout - Server will clear HttpOnly cookies
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    // Server clears cookies automatically
  },
};


