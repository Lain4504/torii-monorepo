import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type {
    OrderResponseDTO,
    OrderCreateDTO,
    OrderQueryDTO,
    OrderConfirmDTO,
    StandardApiResponse,
    PaginatedApiResponse
} from '@workspace/schemas';

export const orderApi = {
    /**
     * Get all orders
     */
    async getAllOrders(query?: OrderQueryDTO): Promise<PaginatedApiResponse<OrderResponseDTO>> {
        const response = await apiClient.get<PaginatedApiResponse<OrderResponseDTO>>('/api/orders', {
            params: query,
        });
        return response.data;
    },

    /**
     * Get order by ID
     */
    async getOrder(id: string): Promise<OrderResponseDTO> {
        const response = await apiClient.get<StandardApiResponse<{ order: OrderResponseDTO }>>(`/api/orders/${id}`);
        return response.data.data!.order;
    },

    /**
     * Create order
     */
    async createOrder(data: OrderCreateDTO): Promise<OrderResponseDTO> {
        // Include courseId in metadata for course purchase type
        const payload = {
            ...data,
            metadata: {
                ...data.metadata,
                courseId: data.courseId, // Store courseId in metadata for later enrollment creation
            },
        };
        const response = await apiClient.post<StandardApiResponse<{ order: OrderResponseDTO }>>('/api/orders', payload);

        if (response.data && response.data.success === false) {
            throw new Error(response.data.message || 'Unknown error');
        }

        if (!response.data || !response.data.data || !response.data.data.order) {
            console.error('Invalid response structure:', response.data);
            throw new Error(`Failed to create order: Invalid response from server. Status: ${response.status}`);
        }

        return response.data.data.order;
    },

    /**
     * Confirm order
     */
    async confirmOrder(orderId: string, data: OrderConfirmDTO): Promise<OrderResponseDTO> {
        const response = await apiClient.post<StandardApiResponse<{ order: OrderResponseDTO }>>(`/api/orders/${orderId}/confirm`, data);

        if (response.data && response.data.success === false) {
            throw new Error(response.data.message || 'Unknown error');
        }

        if (!response.data || !response.data.data || !response.data.data.order) {
            console.error('Invalid response structure:', response.data);
            throw new Error('Failed to confirm order: Invalid response from server');
        }

        return response.data.data.order;
    },
};

/**
 * Hook: Get paginated orders
 */
export function useOrders(query?: OrderQueryDTO) {
    return useQuery({
        queryKey: ['orders', query],
        queryFn: () => orderApi.getAllOrders(query),
    });
}

/**
 * Hook: Get single order detail
 */
export function useOrder(id: string) {
    return useQuery({
        queryKey: ['orders', id],
        queryFn: () => orderApi.getOrder(id),
        enabled: !!id,
    });
}

// Legacy Export for transient phase
export const paymentApi = orderApi;
