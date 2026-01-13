import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type {
    OrderResponseDTO,
    OrderCreateDTO,
    OrderQueryDTO,
    OrderConfirmDTO,
    PaginatedResponseDTO,
} from '@workspace/schemas';

export const orderApi = {
    /**
     * Get all orders
     */
    async getAllOrders(query?: OrderQueryDTO): Promise<PaginatedResponseDTO<OrderResponseDTO>> {
        const response = await apiClient.get<PaginatedResponseDTO<OrderResponseDTO>>('/api/orders', {
            params: query,
        });
        return response.data;
    },

    /**
     * Get order by ID
     */
    async getOrder(id: string): Promise<OrderResponseDTO> {
        const response = await apiClient.get<OrderResponseDTO>(`/api/orders/${id}`);
        return response.data;
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
        const response = await apiClient.post<OrderResponseDTO>('/api/orders', payload);
        return response.data;
    },

    /**
     * Confirm order
     */
    async confirmOrder(orderId: string, data: OrderConfirmDTO): Promise<OrderResponseDTO> {
        const response = await apiClient.post<OrderResponseDTO>(`/api/orders/${orderId}/confirm`, data);
        return response.data;
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
