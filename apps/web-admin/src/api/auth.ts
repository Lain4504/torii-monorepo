import { apiClient } from './api-client'

export const forgotPassword = async (email: string) => {
    const response = await apiClient.post('/api/auth/forgot-password', { email })
    return response.data
}
