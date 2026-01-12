import { apiClient } from '../api-client';
import type {
    OrderResponseDTO,
    OrderQueryDTO,
    PaginatedResponseDTO,
} from '@workspace/schemas';

export const orderApi = {
    /**
     * Get all payments
     */
    async getAllPayments(query?: OrderQueryDTO): Promise<PaginatedResponseDTO<OrderResponseDTO>> {
        const response = await apiClient.get<PaginatedResponseDTO<OrderResponseDTO>>('/api/payments', {
            params: query,
        });
        return response.data;
    },

    /**
     * Get payment by ID
     */
    async getPayment(id: string): Promise<OrderResponseDTO> {
        const response = await apiClient.get<OrderResponseDTO>(`/api/payments/${id}`);
        return response.data;
    },
};
