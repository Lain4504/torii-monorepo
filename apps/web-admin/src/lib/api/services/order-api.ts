import { apiClient } from '../api-client.ts';
import type {
    OrderResponseDTO,
    OrderQueryDTO,
    PaginatedApiResponse,
    StandardApiResponse,
} from '@workspace/schemas';

export const orderApi = {
    /**
     * Get all orders
     */
    async getAllOrders(query?: OrderQueryDTO): Promise<PaginatedApiResponse<OrderResponseDTO>> {
        const response = await apiClient.get<PaginatedApiResponse<OrderResponseDTO>>('/api/academy/orders/admin', { params: query });
        return response.data;
    },

    /**
     * Get order by ID
     */
    async getOrder(id: string): Promise<OrderResponseDTO> {
        const response = await apiClient.get<StandardApiResponse<OrderResponseDTO>>(`/api/academy/orders/admin/${id}`);
        return response.data.data!;
    },

    /**
     * Update order status
     */
    async updateOrderStatus(id: string, status: string): Promise<OrderResponseDTO> {
        const response = await apiClient.patch<StandardApiResponse<OrderResponseDTO>>(`/api/academy/orders/admin/${id}/status`, { status });
        return response.data.data!;
    },

    async getOrderStats(params?: any): Promise<any> {
        const response = await apiClient.get<StandardApiResponse<any>>('/api/academy/orders/stats', { params });
        return response.data.data;
    },

    async getAllTransactions(params?: any): Promise<any> {
        const response = await apiClient.get<StandardApiResponse<any>>('/api/academy/orders/transactions', { params });
        return response.data.data;
    },

    async cancelOrder(id: string): Promise<void> {
        await apiClient.post(`/api/academy/orders/${id}/cancel`);
    },

    async exportOrders(params?: any): Promise<void> {
         // Assuming this triggers a download or returns a blob
        await apiClient.get('/api/academy/orders/export', { params, responseType: 'blob' });
    },

    async getOrdersByOffering(offeringId: string, query?: any): Promise<PaginatedApiResponse<OrderResponseDTO>> {
        const response = await apiClient.get<PaginatedApiResponse<OrderResponseDTO>>(`/api/academy/course-offerings/${offeringId}/orders`, { params: query });
        return response.data;
    },

    async getStatsByOffering(offeringId: string): Promise<any> {
        const response = await apiClient.get<StandardApiResponse<any>>(`/api/academy/course-offerings/${offeringId}/stats`);
        return response.data.data;
    }
};
