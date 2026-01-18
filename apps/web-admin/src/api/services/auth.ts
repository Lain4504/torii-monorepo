import { apiClient } from '@/api/api-client.ts'

export const forgotPassword = async (email: string) => {
    const response = await apiClient.post('/api/auth/forgot-password', { email })
    return response.data
}
