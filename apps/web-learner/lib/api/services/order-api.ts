import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type {
    OrderResponseDTO,
    OrderCreateDTO,
    OrderQueryDTO,
    OrderConfirmDTO,
    StandardApiResponse,
    PaginatedApiResponse,
    BalanceTransactionPaginatedResponse
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

        return response.data.data!.order;
    },

    /**
     * Confirm order
     */
    async confirmOrder(orderId: string, data: OrderConfirmDTO): Promise<OrderResponseDTO> {
        const response = await apiClient.post<StandardApiResponse<{ order: OrderResponseDTO }>>(`/api/orders/${orderId}/confirm`, data);

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
