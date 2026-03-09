import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api-client';
import type {
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

export interface LearnerOrder {
    id: string;
    transactionId?: string;
    code: string;
    status: string;
    paymentMethod?: string;
    createdAt: string;
    amount: number;
    description: string;
    items?: Array<{
        offeringId: string;
        offering?: { id: string; title: string; code: string };
    }>;
    metadata?: any;
}

export interface OrderFulfillmentSummary {
    id: string;
    code: string;
    status: string;
    paidAt?: string | null;
    grandTotal: number | string;
    currency: string;
    items: Array<{
        offeringId: string;
        offeringCode: string;
        offeringTitle: string;
        expectedClassIds: string[];
        enrolledClassIds: string[];
        missingClassIds: string[];
    }>;
}

export const orderApi = {
    /**
     * Get all orders
     */
    async getAllOrders(query?: OrderQueryDTO): Promise<PaginatedApiResponse<LearnerOrder>> {
        const statusMap: Record<string, string> = {
            completed: 'PAID',
            paid: 'PAID',
            pending: 'PENDING',
            processing: 'PROCESSING',
            failed: 'FAILED',
            cancelled: 'CANCELLED',
            refunded: 'REFUNDED',
            timed_out: 'FAILED',
        };
        const normalizedStatus =
            typeof query?.status === 'string'
                ? (statusMap[query.status.toLowerCase()] ?? query.status.toUpperCase())
                : query?.status;
        const response = await apiClient.get<StandardApiResponse<{ items: any[]; total: number; page: number; limit: number; totalPages: number }>>('/api/academy/orders/my', {
            params: { ...query, status: normalizedStatus },
        });
        const payload = response.data.data!;
        const mapped = (payload.items ?? []).map((order: any) => ({
            id: order.id,
            transactionId: order.code,
            code: order.code,
            status: order.status,
            paymentMethod: order.paymentMethod,
            createdAt: order.createdAt,
            amount: Number(order.grandTotal ?? 0),
            description: order.items?.map((item: any) => item.offering?.title).filter(Boolean).join(', ') || `Đơn hàng ${order.code}`,
            metadata: order.metadata,
            items: order.items,
        }));
        return {
            success: response.data.success,
            data: mapped,
            total: payload.total,
            page: payload.page,
            limit: payload.limit,
            totalPages: payload.totalPages,
        };
    },

    /**
     * Preview order totals and discounts
     */
    async previewOrder(data: OrderPreviewDTO): Promise<OrderPreviewResponse> {
        const response = await apiClient.post<StandardApiResponse<OrderPreviewResponse>>('/api/academy/orders/preview', data);
        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.message || 'Failed to preview order');
        }
        const payload = response.data.data as any;
        return {
            subtotal: Number(payload.subTotal ?? 0),
            discount: Number(payload.discountTotal ?? 0),
            total: Number(payload.grandTotal ?? 0),
            items: payload.offerings ?? [],
        };
    },

    /**
     * Get order by ID
     */
    async getOrder(id: string): Promise<LearnerOrder> {
        const response = await apiClient.get<StandardApiResponse<{ item: any }>>(`/api/academy/orders/my/${id}`);
        const order = response.data.data!.item;
        return {
            id: order.id,
            transactionId: order.code,
            code: order.code,
            status: order.status,
            paymentMethod: order.paymentMethod,
            createdAt: order.createdAt,
            amount: Number(order.grandTotal ?? 0),
            description: order.items?.map((item: any) => item.offering?.title).filter(Boolean).join(', ') || `Đơn hàng ${order.code}`,
            metadata: order.metadata,
            items: order.items,
        };
    },

    /**
     * Create order (Checkout)
     */
    async createOrder(data: OrderCheckoutDTO): Promise<{ orderCode?: string; id?: string; paymentUrl?: string }> {
        const response = await apiClient.post<StandardApiResponse<{ orderCode?: string; id?: string; paymentUrl?: string }>>('/api/academy/orders/checkout', data);
        
        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.message || 'Failed to create order');
        }

        return response.data.data;
    },

    /**
     * Confirm order (Legacy/Internal)
     */
    async confirmOrder(orderId: string, data: OrderConfirmDTO): Promise<any> {
        const response = await apiClient.post<StandardApiResponse<{ order: any }>>(`/api/academy/orders/${orderId}/confirm`, data);
        return response.data.data!.order;
    },

    async getOrderByCode(orderCode: string): Promise<OrderFulfillmentSummary> {
        const response = await apiClient.get<StandardApiResponse<OrderFulfillmentSummary>>(
            `/api/academy/orders/by-code/${orderCode}`,
        );
        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.message || 'Failed to fetch order by code');
        }
        return response.data.data;
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
