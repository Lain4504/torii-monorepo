import { apiClient } from '@/api/api-client.ts'
import type { StandardApiResponse } from '@workspace/schemas'

export const forgotPassword = async (email: string) => {
    const response = await apiClient.post<StandardApiResponse<any>>('/api/auth/forgot-password', { email })
    return response.data
}
