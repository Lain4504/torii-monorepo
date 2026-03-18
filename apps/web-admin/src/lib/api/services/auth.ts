import { apiClient } from '@/lib/api/api-client.ts'
import type { StandardApiResponse } from '@workspace/schemas'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const authApi = {
    forgotPassword: async (email: string) => {
        const response = await apiClient.post<StandardApiResponse<any>>('/api/auth/forgot-password', {
            email,
            clientType: 'admin',
        })
        return response.data
    },
    resetPassword: async (data: { token: string, password: string }) => {
        const response = await apiClient.post<StandardApiResponse<any>>('/api/auth/reset-password', data)
        return response.data
    },

    async getLinkedProviders(): Promise<{ providers: string[] }> {
        const response = await apiClient.get<StandardApiResponse<{ providers: string[] }>>('/api/auth/linked-providers')
        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.message || 'Failed to load linked providers')
        }
        return {
            providers: response.data.data.providers || [],
        }
    },

    async unlinkProvider(provider: 'google' | 'facebook'): Promise<{ success: boolean; message?: string }> {
        const response = await apiClient.delete<StandardApiResponse<null>>(`/api/auth/link/${provider}`)
        return {
            success: response.data.success,
            message: response.data.message,
        }
    },
}

export function useLinkedProviders() {
    return useQuery({
        queryKey: ['linked-providers'],
        queryFn: () => authApi.getLinkedProviders(),
    })
}

export function useUnlinkProvider() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (provider: 'google' | 'facebook') => authApi.unlinkProvider(provider),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['linked-providers'] })
        },
    })
}
