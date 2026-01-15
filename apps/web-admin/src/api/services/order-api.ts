import { apiClient } from '../api-client';
import type {
    OrderResponseDTO,
    OrderQueryDTO,
    PaymentResponseDTO,
    PaymentQueryDTO,
    PaginatedApiResponse,
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
        const response = await apiClient.get<OrderResponseDTO>(`/api/orders/${id}`);
        return response.data;
    },

    /**
     * Get all raw transactions (payments)
     */
    async getAllTransactions(query?: PaymentQueryDTO): Promise<PaginatedApiResponse<PaymentResponseDTO>> {
        const response = await apiClient.get<PaginatedApiResponse<PaymentResponseDTO>>('/api/orders/transactions', {
            params: query,
        });
        return response.data;
    },
};
