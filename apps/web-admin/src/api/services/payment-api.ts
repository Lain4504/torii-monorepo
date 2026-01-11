import { apiClient } from '../api-client';
import type {
    PaymentResponseDTO,
    PaymentQueryDTO,
    PaginatedResponseDTO,
} from '@workspace/schemas';

export const paymentApi = {
    /**
     * Get all payments
     */
    async getAllPayments(query?: PaymentQueryDTO): Promise<PaginatedResponseDTO<PaymentResponseDTO>> {
        const response = await apiClient.get<PaginatedResponseDTO<PaymentResponseDTO>>('/api/payments', {
            params: query,
        });
        return response.data;
    },

    /**
     * Get payment by ID
     */
    async getPayment(id: string): Promise<PaymentResponseDTO> {
        const response = await apiClient.get<PaymentResponseDTO>(`/api/payments/${id}`);
        return response.data;
    },
};
