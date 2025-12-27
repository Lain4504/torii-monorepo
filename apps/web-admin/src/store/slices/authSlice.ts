import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '../../api/auth';
import type { LoginRequest, RegisterRequest, UserRole } from '../../api/auth';

interface AuthState {
  user: {
    id: string;
    email: string;
    fullName?: string;
    role?: UserRole;
  } | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

// Note: We don't store token in state for security
// Server uses HttpOnly cookies for authentication
// isAuthenticated is determined by API calls, not cookie reading
const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false, // Will be set based on API response
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
    try {
      const response = await authApi.login(credentials);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response;
    } catch (error: any) {
      // Extract error message from various formats
      const errorMessage = 
        error?.message || 
        error?.response?.data?.message || 
        error?.response?.data?.error || 
        error?.response?.data || 
        'Đăng nhập thất bại';
      
      return rejectWithValue(typeof errorMessage === 'string' ? errorMessage : 'Đăng nhập thất bại');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: RegisterRequest, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
    try {
      const response = await authApi.register(data);
      if (response.error) {
        return rejectWithValue(response.error);
      }
      return response;
    } catch (error: any) {
      // Extract error message from various formats
      const errorMessage = 
        error?.message || // Error thrown from authApi
        error?.response?.data?.message || // NestJS error format
        error?.response?.data?.error || // Alternative error field
        error?.response?.data || // Direct error data
        'Đăng ký thất bại'; // Fallback
      
      return rejectWithValue(typeof errorMessage === 'string' ? errorMessage : 'Đăng ký thất bại');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_: void, { rejectWithValue }: { rejectWithValue: (value: string) => any }) => {
    try {
      await authApi.logout();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Đăng xuất thất bại');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state: AuthState) => {
      state.error = null;
    },
    setCredentials: (state: AuthState, action: PayloadAction<{ user: AuthState['user'] }>) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      // Token is stored in HttpOnly cookie by server, not in state
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state: AuthState) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state: AuthState, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user || null;
        // Token is stored in HttpOnly cookie by server, not in state
        state.error = null;
      })
      .addCase(loginUser.rejected, (state: AuthState, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerUser.pending, (state: AuthState) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state: AuthState, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user || null;
        // Token is stored in HttpOnly cookie by server, not in state
        state.error = null;
      })
      .addCase(registerUser.rejected, (state: AuthState, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string;
      })
      // Logout
      .addCase(logoutUser.fulfilled, (state: AuthState) => {
        state.user = null;
        state.isAuthenticated = false;
        // Server clears HttpOnly cookies, no need to clear token here
        state.error = null;
      });
  },
});

export const { clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;

// Export types for use in other files
export type { UserRole } from '../../api/auth';
export type { AuthState };

