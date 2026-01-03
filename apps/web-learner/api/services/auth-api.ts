import { apiClient } from '../api-client';

export const authApi = {
    /**
     * Resend verification email
     */
    async resendVerification(email: string): Promise<{ success: boolean; message: string }> {
        const response = await apiClient.post('/api/auth/resend-verification', { email });
        return response.data;
    }
};
