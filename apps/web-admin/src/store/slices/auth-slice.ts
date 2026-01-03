import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';
import { apiClient } from '@/lib/api-client';
import type { UserResponseDTO, UserLoginDTO } from '@workspace/schemas';

// Extended User type including permissions and profile fields
export interface User extends UserResponseDTO {
    permissions: string[];
    avatarUrl?: string | null;
    staffTemplate?: 'sales_staff' | 'academic_staff' | 'support_staff';
}

export interface AuthState {
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    user: User | null;
}

const initialState: AuthState = {
    isAuthenticated: false,
    isLoading: true, // Start as true while checking auth
    error: null,
    user: null,
};

// Async Thunks
export const login = createAsyncThunk(
    'auth/login',
    async (credentials: UserLoginDTO, { rejectWithValue }) => {
        try {
            const response = await apiClient.post('/api/auth/login', credentials);
            return response.data.data.user;
        } catch (error: any) {
            if (error.response && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            }
            return rejectWithValue(error.message || 'Login failed');
        }
    }
);

export const logout = createAsyncThunk(
    'auth/logout',
    async (_, { rejectWithValue }) => {
        try {
            await apiClient.post('/api/auth/logout');
            return null;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Logout failed');
        }
    }
);

export const checkAuth = createAsyncThunk(
    'auth/check',
    async (_, { rejectWithValue }) => {
        try {
            const response = await apiClient.get('/api/auth/profile');
            return response.data.data.user;
        } catch (error) {
            return rejectWithValue('Not authenticated');
        }
    }
);

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuthenticated: (state, action: PayloadAction<{ isAuthenticated: boolean; user?: User }>) => {
            state.isAuthenticated = action.payload.isAuthenticated;
            state.user = action.payload.user || null;
            state.error = null;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        setUser: (state, action: PayloadAction<User>) => {
            state.user = action.payload;
        },
        setPermissions: (state, action: PayloadAction<string[]>) => {
            if (state.user) {
                state.user.permissions = action.payload;
            }
        },
        clearUser: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        }
    },
    extraReducers: (builder) => {
        // Login
        builder.addCase(login.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        });
        builder.addCase(login.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.user = action.payload;
        });
        builder.addCase(login.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload as string;
        });

        // Logout
        builder.addCase(logout.fulfilled, (state) => {
            state.user = null;
            state.isAuthenticated = false;
        });
        builder.addCase(logout.rejected, (state) => {
            state.user = null;
            state.isAuthenticated = false;
        });

        // Check Auth
        builder.addCase(checkAuth.pending, () => {
            // state.isLoading = true; // Handled manually or by AuthGuard
        });
        builder.addCase(checkAuth.fulfilled, (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.user = action.payload;
        });
        builder.addCase(checkAuth.rejected, (state) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.user = null;
        });
    }
});

export const { setAuthenticated, setLoading, setError, setUser, setPermissions, clearUser } = authSlice.actions;

// Selectors
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthUser = (state: RootState) => state.auth.user;
export const selectUser = (state: RootState) => state.auth.user;
export const selectRole = (state: RootState) => state.auth.user?.role;
export const selectPermissions = (state: RootState) => state.auth.user?.permissions || [];
export const selectStaffTemplate = (state: RootState) => state.auth.user?.staffTemplate;

export default authSlice.reducer;

