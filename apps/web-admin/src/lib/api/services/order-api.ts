import { apiClient } from '../api-client.ts';
import type {
    OrderResponseDTO,
    OrderQueryDTO,
    PaymentResponseDTO,
    PaymentQueryDTO,
    PaginatedApiResponse,
    StandardApiResponse,
} from '@workspace/schemas';

export const orderApi = {
    /**
     * Get all orders
     */
    async getAllOrders(query?: OrderQueryDTO): Promise<PaginatedApiResponse<OrderResponseDTO>> {
        const response = await apiClient.post<PaginatedApiResponse<OrderResponseDTO>>('/api/orders/search', query);
        return response.data;
    },

    /**
     * Get order statistics
     */
    async getOrderStats(query?: OrderQueryDTO): Promise<StandardApiResponse<{ totalRevenue: number, orderCount: number }>> {
        const response = await apiClient.get<StandardApiResponse<{ totalRevenue: number, orderCount: number }>>('/api/orders/stats', {
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
     * Get all raw transactions (payments)
     */
    async getAllTransactions(query?: PaymentQueryDTO): Promise<PaginatedApiResponse<PaymentResponseDTO>> {
        const response = await apiClient.post<PaginatedApiResponse<PaymentResponseDTO>>('/api/orders/transactions/search', query);
        return response.data;
    },
};
