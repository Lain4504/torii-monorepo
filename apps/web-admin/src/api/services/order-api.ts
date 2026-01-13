import { apiClient } from '../api-client';
import type {
    OrderResponseDTO,
    OrderQueryDTO,
    PaginatedResponseDTO,
    PaymentResponseDTO,
    PaymentQueryDTO,
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
     * Get all raw transactions (payments)
     */
    async getAllTransactions(query?: PaymentQueryDTO): Promise<PaginatedResponseDTO<PaymentResponseDTO>> {
        const response = await apiClient.get<PaginatedResponseDTO<PaymentResponseDTO>>('/api/orders/transactions', {
            params: query,
        });
        return response.data;
    },
};
