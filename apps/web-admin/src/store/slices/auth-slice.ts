import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';

export interface User {
    id: string;
    email: string;
    fullName: string;
    role: string;
    status: string;
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
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.error = null;
        },
    },
});

export const { setAuthenticated, setLoading, setError, logout } = authSlice.actions;

// Selectors
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectUser = (state: RootState) => state.auth.user;

export default authSlice.reducer;
