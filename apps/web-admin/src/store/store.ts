import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
});

// Log state mỗi khi có thay đổi (chỉ trong development)
if (import.meta.env.DEV) {
  store.subscribe(() => {
    const state = store.getState();
    console.log('🔴 Redux State:', state);
    console.log('🔴 Auth State:', state.auth);
  });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;






