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
    offeringIds?: string[];
    subscriptionPlanIds?: string[];
    couponCode?: string;
}

export interface OrderCheckoutDTO {
    offeringIds?: string[];
    subscriptionPlanIds?: string[];
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

    async getOrderByCode(orderCode: string): Promise<OrderFulfillmentSummary> {
        const response = await apiClient.get<StandardApiResponse<OrderFulfillmentSummary>>(
            `/api/academy/orders/by-code/${orderCode}`,
        );
        if (!response.data.success || !response.data.data) {
            throw new Error(response.data.message || 'Failed to fetch order by code');
        }
        return response.data.data;
    },
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

// Legacy Export for transient phase
export const paymentApi = orderApi;
