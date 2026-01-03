import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../api-client';
import type { UserResponseDTO, UserLoginDTO, UserRegistrationDTO } from '@workspace/schemas';

// Define the auth state
export interface AuthState {
    user: UserResponseDTO | null;
    isAuthenticated: boolean;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

// Initial state
const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    status: 'idle',
    error: null,
};

// Async Thunks

export const login = createAsyncThunk(
    'auth/login',
    async (credentials: UserLoginDTO, { rejectWithValue }) => {
        try {
            // Updated endpoint to verify: Gateway prefix /api might be needed or handled by base URL
            // Gateway proxy map: /api/auth -> Identity Service /auth
            const response = await apiClient.post('/api/auth/login', credentials);

            // Response structure: { success: true, data: { user: ... } }
            // Web cookie flow handles tokens automatically.

            return response.data.data.user;
        } catch (error: any) {
            // Return error message
            if (error.response && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || 'Login failed');
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async (userData: UserRegistrationDTO, { rejectWithValue }) => {
        try {
            // Updated endpoint
            const response = await apiClient.post('/api/auth/register', userData);
            return response.data; // UserResponseDTO
        } catch (error: any) {
            if (error.response && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || 'Registration failed');
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            // Updated endpoint
            await apiClient.post('/api/auth/logout');
            return;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Logout failed');
        }
    }
);

export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        try {
            // New endpoint needed: GET /auth/me or /users/profile/me
            // For now, assuming we might need to fetch profile using stored token/cookie
            const response = await apiClient.get('/api/auth/profile');
            return response.data.data.user; // Extract user from { success: true, data: { user } }
        } catch (error) {
            return rejectWithValue('Not authenticated');
        }
    }
);

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        resetAuth: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.status = 'idle';
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(login.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(login.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Register
        builder
            .addCase(register.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.status = 'succeeded';
                // Usually registration doesn't auto-login unless backend returns tokens
                // If backend returns tokens and sets cookies, we could set isAuthenticated = true
                // strict implementation: require login after register
            })
            .addCase(register.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });

        // Logout
        builder
            .addCase(logout.fulfilled, (state) => {
                state.isAuthenticated = false;
                state.user = null;
                state.status = 'idle';
            });

        // Check Auth
        builder
            .addCase(checkAuth.pending, (state) => {
                // Don't set global loading here if we want background check?
                // But for initial load, we might want to know.
                // Let's keep status update but handle UI gracefully.
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.isAuthenticated = true;
                state.user = action.payload;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.isAuthenticated = false;
                state.user = null;
            });
    },
});

export const { clearError, resetAuth } = authSlice.actions;

export default authSlice.reducer;
