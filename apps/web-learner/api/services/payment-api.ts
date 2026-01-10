import { apiClient } from '../api-client';
import type {
    PaymentResponseDTO,
    PaymentCreateDTO,
    PaymentQueryDTO,
    PaymentConfirmDTO,
    PaginatedResponseDTO,
} from '@workspace/schemas';

export const paymentApi = {
    /**
     * Get all payments
     */
    async getAllPayments(query?: PaymentQueryDTO): Promise<PaginatedResponseDTO<PaymentResponseDTO>> {
        const response = await apiClient.get<PaginatedResponseDTO<PaymentResponseDTO>>('/payments', {
            params: query,
        });
        return response.data;
    },

    /**
     * Get payment by ID
     */
    async getPayment(id: string): Promise<PaymentResponseDTO> {
        const response = await apiClient.get<PaymentResponseDTO>(`/payments/${id}`);
        return response.data;
    },

    /**
     * Create payment (mock)
     */
    async createPayment(data: PaymentCreateDTO): Promise<PaymentResponseDTO> {
        // Include courseId in metadata for course purchase type
        const payload = {
            ...data,
            metadata: {
                ...data.metadata,
                courseId: data.courseId, // Store courseId in metadata for later enrollment creation
            },
        };
        const response = await apiClient.post<PaymentResponseDTO>('/payments', payload);
        return response.data;
    },

    /**
     * Confirm payment (mock)
     */
    async confirmPayment(paymentId: string, data: PaymentConfirmDTO): Promise<PaymentResponseDTO> {
        const response = await apiClient.post<PaymentResponseDTO>(`/payments/${paymentId}/confirm`, data);
        return response.data;
    },
};

