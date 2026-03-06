import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type {
    OrderResponseDTO,
    OrderQueryDTO,
    OrderConfirmDTO,
    StandardApiResponse,
    PaginatedApiResponse,
    BalanceTransactionPaginatedResponse,
    PaymentMethod
} from '@workspace/schemas';

export interface OrderPreviewDTO {
    offeringIds: string[];
    couponCode?: string;
}

export interface OrderCheckoutDTO {
    offeringIds: string[];
    couponCode?: string;
    paymentMethod: PaymentMethod | string;
    description?: string;
    metadata?: any;
}

export interface OrderPreviewResponse {
    subtotal: number;
    discount: number;
    total: number;
    items: any[];
}

export const orderApi = {
    /**
     * Get all orders
     */
    async getAllOrders(query?: OrderQueryDTO): Promise<PaginatedApiResponse<OrderResponseDTO>> {
        const response = await apiClient.get<PaginatedApiResponse<OrderResponseDTO>>('/api/academy/orders', {
            params: query,
        });
        return response.data;
    },

    /**
     * Preview order totals and discounts
     */
    async previewOrder(data: OrderPreviewDTO): Promise<OrderPreviewResponse> {
        const response = await apiClient.post<StandardApiResponse<OrderPreviewResponse>>('/api/academy/orders/preview', data);
        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.message || 'Failed to preview order');
        }
        return response.data.data;
    },

    /**
     * Get order by ID
     */
    async getOrder(id: string): Promise<OrderResponseDTO> {
        const response = await apiClient.get<StandardApiResponse<{ item: OrderResponseDTO }>>(`/api/academy/orders/\${id}`);
        return response.data.data!.item;
    },

    /**
     * Create order (Checkout)
     */
    async createOrder(data: OrderCheckoutDTO): Promise<OrderResponseDTO & { paymentUrl?: string }> {
        const response = await apiClient.post<StandardApiResponse<OrderResponseDTO & { paymentUrl?: string }>>('/api/academy/orders/checkout', data);
        
        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.message || 'Failed to create order');
        }

        return response.data.data;
    },

    /**
     * Confirm order (Legacy/Internal)
     */
    async confirmOrder(orderId: string, data: OrderConfirmDTO): Promise<OrderResponseDTO> {
        const response = await apiClient.post<StandardApiResponse<{ order: OrderResponseDTO }>>(`/api/academy/orders/\${orderId}/confirm`, data);
        return response.data.data!.order;
    },

    /**
     * Get user balance transaction history (internal coins)
     */
    async getBalanceHistory(params: { page?: number; limit?: number; type?: string; aiOnly?: boolean } = {}): Promise<BalanceTransactionPaginatedResponse> {
        const response = await apiClient.get<StandardApiResponse<BalanceTransactionPaginatedResponse>>('/api/orders/wallet/balance-history', {
            params,
        });
        if (response.data.success && response.data.data) {
            return response.data.data;
        }
        throw new Error(response.data.message || 'Failed to fetch balance history');
    },

    /**
     * Get current user balance
     */
    async getBalance(): Promise<number> {
        const response = await apiClient.get<StandardApiResponse<{ balance: number }>>('/api/orders/wallet/balance');
        if (response.data.success && response.data.data) {
            return response.data.data.balance;
        }
        return 0;
    }
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

/**
 * Hook: Get balance history
 */
export function useBalanceHistory(params: { page?: number; limit?: number; type?: string; aiOnly?: boolean } = {}) {
    return useQuery({
        queryKey: ['balance-history', params],
        queryFn: () => orderApi.getBalanceHistory(params),
        staleTime: 30000,
    });
}

/**
 * Hook: Get AI usage (token billing) history
 */
export function useAiUsageHistory(params: { page?: number; limit?: number } = {}) {
    return useQuery({
        queryKey: ['ai-usage-history', params],
        queryFn: () => orderApi.getBalanceHistory({ ...params, aiOnly: true }),
        staleTime: 30000,
    });
}

/**
 * Hook: Get current balance
 */
export function useBalance() {
    return useQuery({
        queryKey: ['user-balance'],
        queryFn: () => orderApi.getBalance(),
        staleTime: 60000,
    });
}

// Legacy Export for transient phase
export const paymentApi = orderApi;
