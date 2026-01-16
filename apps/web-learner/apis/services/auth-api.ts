import { apiClient } from '../api-client';
import type { StandardApiResponse } from '@workspace/schemas';

export const authApi = {
    /**
     * Resend verification email
     */
    async resendVerification(email: string): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.post<StandardApiResponse<null>>('/api/auth/resend-verification', { email });
        return {
            success: response.data.success,
            message: response.data.message || '',
        };
    },

    async logout(): Promise<void> {
        await apiClient.post('/api/auth/logout');
    },

    async verifyResetToken(token: string): Promise<{ success: boolean; message?: string }> {
        const response = await apiClient.post<StandardApiResponse<{ email: string }>>('/api/auth/verify-reset-token', { token });
        return {
            success: response.data.success,
            message: response.data.message,
        };
    },

    async resetPassword(data: { token: string; password: string }): Promise<{ success: boolean; message?: string }> {
        const response = await apiClient.post<StandardApiResponse<null>>('/api/auth/reset-password', data);
        return {
            success: response.data.success,
            message: response.data.message,
        };
    },

    async forgotPassword(email: string): Promise<{ success: boolean; message?: string }> {
        const response = await apiClient.post<StandardApiResponse<null>>('/api/auth/forgot-password', { email });
        return {
            success: response.data.success,
            message: response.data.message,
        };
    },

    async verifyEmail(token: string): Promise<{ success: boolean; message?: string }> {
        const response = await apiClient.post<StandardApiResponse<{ email: string }>>('/api/auth/verify-email', { token });
        return {
            success: response.data.success,
            message: response.data.message,
        };
    }
};

import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Hook: Logout
 */
export function useLogout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => authApi.logout(),
        onSuccess: () => {
            queryClient.clear();
            // Additional cleanup if needed
        },
    });
}

/**
 * Hook: Resend Verification Email
 */
export function useResendVerification() {
    return useMutation({
        mutationFn: (email: string) => authApi.resendVerification(email),
    });
}

/**
 * Hook: Verify Reset Token
 */
export function useVerifyResetToken() {
    return useMutation({
        mutationFn: (token: string) => authApi.verifyResetToken(token),
    });
}

/**
 * Hook: Reset Password
 */
export function useResetPassword() {
    return useMutation({
        mutationFn: (data: { token: string; password: string }) => authApi.resetPassword(data),
    });
}

/**
 * Hook: Forgot Password
 */
export function useForgotPassword() {
    return useMutation({
        mutationFn: (email: string) => authApi.forgotPassword(email),
    });
}

/**
 * Hook: Verify Email
 */
export function useVerifyEmail() {
    return useMutation({
        mutationFn: (token: string) => authApi.verifyEmail(token),
    });
}
