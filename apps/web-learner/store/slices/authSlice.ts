import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '../../api/api-client';
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
                console.error('Login error:', error.response.data.message);
                return rejectWithValue(error.response.data.message);
            }
            console.error('Login error:', error.message);
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
            return response.data.data.user; // Extract user from { success: true, data: { user } }
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
            const response = await apiClient.get('/api/auth/me');
            return response.data.data.user; // Extract user from { success: true, data: { user } }
        } catch (error) {
            return rejectWithValue('Not authenticated');
        }
    }
);

export const verifyEmail = createAsyncThunk(
    'auth/verifyEmail',
    async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/api/auth/verify-email', { email, otp });
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || 'Verification failed');
        }
    }
);

export const fetchProfile = createAsyncThunk(
    'auth/fetchProfile',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/api/auth/me');
            return response.data.data.user;
        } catch (error: any) {
            if (error.response && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || 'Failed to fetch profile');
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
            .addCase(register.fulfilled, (state) => {
                state.status = 'succeeded';
                // Do NOT set isAuthenticated = true here.
                // The user must verify their email first.
                // The component will handle the redirect to the verification page based on the 'succeeded' status.
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
            })

            // Verify Email
            .addCase(verifyEmail.fulfilled, (state) => {
                if (state.user) {
                    state.user.verifiedAt = new Date();
                }
            })

            // Fetch Profile
            .addCase(fetchProfile.fulfilled, (state, action) => {
                state.user = action.payload;
                state.isAuthenticated = true;
            });
    },
});

export const { clearError, resetAuth } = authSlice.actions;

export default authSlice.reducer;
