import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/store';

export interface UserState {
    id: string | null;
    email: string | null;
    fullName: string | null;
    avatarUrl: string | null;
    role: 'admin' | 'staff' | 'lecturer' | 'learner' | null;
    status: string | null;
    permissions: string[];
    staffTemplate?: 'sales_staff' | 'academic_staff' | 'support_staff';
}

const initialState: UserState = {
    id: null,
    email: null,
    fullName: null,
    avatarUrl: null,
    role: null,
    status: null,
    permissions: [],
    staffTemplate: undefined,
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (_state, action: PayloadAction<UserState>) => {
            return action.payload;
        },
        clearUser: () => {
            return initialState;
        },
        setPermissions: (state, action: PayloadAction<string[]>) => {
            state.permissions = action.payload;
        },
    },
});

export const { setUser, clearUser, setPermissions } = userSlice.actions;

// Selectors
export const selectUser = (state: RootState) => state.user;
export const selectRole = (state: RootState) => state.user.role;
export const selectPermissions = (state: RootState) => state.user.permissions;
export const selectStaffTemplate = (state: RootState) => state.user.staffTemplate;

export default userSlice.reducer;
