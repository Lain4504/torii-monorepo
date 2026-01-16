import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/api-client.ts';
import type {
    PaginatedApiResponse,
    NotificationResponseDTO,
    NotificationQueryDTO,
    NotificationUnreadCountResponseDTO,
    StandardApiResponse,
} from '@workspace/schemas';

// ============================================================================
// API Functions
// ============================================================================

export const notificationsApi = {
    // GET /api/notifications
    // Note: Service returns PaginatedResponseDTO directly, not wrapped in StandardApiResponse
    async findAll(params?: NotificationQueryDTO): Promise<PaginatedApiResponse<NotificationResponseDTO>> {
        const response = await apiClient.get<any>('/api/notifications', { params });
        
        // Debug: Log raw response
        console.log('📡 Notifications API - Raw response:', response.data);
        
        let data = response.data;
        
        // Handle string response (if gateway returns arraybuffer that needs parsing)
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                console.error('Failed to parse response as JSON:', e);
                throw new Error('Invalid response format from server');
            }
        }
        
        // Handle both formats: direct PaginatedResponseDTO or wrapped in StandardApiResponse
        if (data.success !== undefined) {
            // Wrapped format: { success: true, data: { data: [], total, ... } }
            if (!data.success || !data.data) {
                throw new Error(data.message || 'Failed to fetch notifications');
            }
            return data as PaginatedApiResponse<NotificationResponseDTO>;
        } else {
            // Direct format: { data: [], total, page, limit, totalPages }
            if (!data.data || !Array.isArray(data.data)) {
                console.error('Invalid response format - data.data is not an array:', data);
                throw new Error('Failed to fetch notifications: invalid response format');
            }
            return data as PaginatedApiResponse<NotificationResponseDTO>;
        }
    },

    // GET /api/notifications/unread-count
    async getUnreadCount(): Promise<NotificationUnreadCountResponseDTO> {
        const response = await apiClient.get<any>('/api/notifications/unread-count');
        
        let data = response.data;
        
        // Handle string response
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                throw new Error('Invalid response format from server');
            }
        }
        
        // Handle both formats
        if (data.success !== undefined) {
            if (data.success && data.data) {
                return data.data;
            }
            throw new Error(data.message || 'Failed to fetch unread count');
        } else {
            // Direct format: { count: number }
            if (data.count === undefined) {
                console.error('Invalid unread count response:', data);
                throw new Error('Failed to fetch unread count: invalid response format');
            }
            return data as NotificationUnreadCountResponseDTO;
        }
    },

    // PATCH /api/notifications/:id/read
    async markAsRead(id: string): Promise<NotificationResponseDTO> {
        const response = await apiClient.patch<any>(`/api/notifications/${id}/read`);
        
        if (response.data.success !== undefined) {
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to mark notification as read');
        } else {
            // Direct format
            return response.data as NotificationResponseDTO;
        }
    },

    // PATCH /api/notifications/read-all
    async markAllAsRead(): Promise<{ success: boolean; message: string; count: number }> {
        const response = await apiClient.patch<any>('/api/notifications/read-all');
        
        if (response.data.success !== undefined) {
            if (response.data.success && response.data.data) {
                return response.data.data;
            }
            throw new Error(response.data.message || 'Failed to mark all notifications as read');
        } else {
            // Direct format
            return response.data as { success: boolean; message: string; count: number };
        }
    },

    // DELETE /api/notifications/:id
    async delete(id: string): Promise<void> {
        const response = await apiClient.delete<any>(`/api/notifications/${id}`);
        
        if (response.data.success !== undefined) {
            if (!response.data.success) {
                throw new Error(response.data.message || 'Failed to delete notification');
            }
        }
        // Direct format: assume success if no error thrown
    },
};

// ============================================================================
// React Query Hooks
// ============================================================================

/**
 * Hook: Get notifications list with pagination
 */
export function useNotifications(params?: NotificationQueryDTO) {
    return useQuery({
        queryKey: ['notifications', params],
        queryFn: () => notificationsApi.findAll(params),
        staleTime: 30000,
        retry: (failureCount, error: any) => {
            // Don't retry on 401 (authentication errors)
            if (error?.response?.status === 401) {
                return false;
            }
            return failureCount < 3;
        },
    });
}

/**
 * Hook: Get unread notifications count
 */
export function useUnreadNotificationsCount() {
    return useQuery({
        queryKey: ['notifications', 'unread-count'],
        queryFn: () => notificationsApi.getUnreadCount(),
        staleTime: 10000, // Refresh every 10 seconds
        refetchInterval: 10000, // Auto-refetch every 10 seconds for real-time updates
        retry: (failureCount, error: any) => {
            // Don't retry on 401 (authentication errors)
            if (error?.response?.status === 401) {
                return false;
            }
            return failureCount < 3;
        },
    });
}

/**
 * Hook: Mark notification as read
 */
export function useMarkNotificationAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => notificationsApi.markAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}

/**
 * Hook: Mark all notifications as read
 */
export function useMarkAllNotificationsAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => notificationsApi.markAllAsRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}

/**
 * Hook: Delete notification
 */
export function useDeleteNotification() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => notificationsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });
}
