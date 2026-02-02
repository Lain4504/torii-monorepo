import { apiClient } from '@/apis/api-client'
import type { Post } from '@workspace/schemas' // We might need this, or define logic type here

export interface CreatePostDto {
    title?: string
    content: string
    type: 'QA'
}

export const qaApi = {
    getFeed: (params: { page: number, limit: number }) => {
        return apiClient.get('/api/posts', { params: { ...params, type: 'QA' } })
    },
    create: (data: CreatePostDto) => {
        return apiClient.post('/api/posts', data)
    },
    getById: (id: string) => {
        return apiClient.get(`/api/posts/${id}`)
    },
    getUserPosts: (userId: string) => {
        return apiClient.get(`/api/posts`, { params: { authorId: userId, type: 'QA' } })
    },
    like: (id: string) => {
        return apiClient.post(`/api/posts/${id}/like`)
    },
    unlike: (id: string) => {
        return apiClient.delete(`/api/posts/${id}/like`)
    }
}
