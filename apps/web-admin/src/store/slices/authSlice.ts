import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { authApi } from '@workspace/ui/api/auth';
import { getCookie } from '@workspace/ui/utils/cookies';
import type { LoginRequest, RegisterRequest } from '@workspace/ui/api/auth';

interface AuthState {
  user: {
    id: string;
    email: string;
    fullName?: string;
  } | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: getCookie('access_token'),
  isLoading: false,
  isAuthenticated: !!getCookie('access_token'),
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
    setCredentials: (state: AuthState, action: PayloadAction<{ user: AuthState['user']; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
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
        state.token = action.payload.session?.access_token || null;
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
        state.token = action.payload.session?.access_token || null;
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
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;

