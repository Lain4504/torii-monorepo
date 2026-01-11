import type {
    OrderCreateDTO,
    OrderQueryDTO,
    OrderResponseDTO,
    OrderConfirmDTO,
    PaginatedResponseDTO,
} from '@workspace/schemas';

/**
 * Order Service Interface
 * Defines the contract for order business logic operations
 */
export interface IOrderService {
    /**
     * Find all orders with pagination and filters
     */
    findAll(query: OrderQueryDTO): Promise<PaginatedResponseDTO<OrderResponseDTO>>;

    /**
     * Find order by ID
     */
    findOne(id: string): Promise<OrderResponseDTO | null>;

    /**
     * Create a new order
     */
    create(userId: string, input: OrderCreateDTO): Promise<OrderResponseDTO>;

    /**
     * Confirm/complete order
     */
    confirm(orderId: string, input: OrderConfirmDTO): Promise<OrderResponseDTO>;

    /**
     * Handle SePay Webhook (which creates Payments and completes Orders)
     */
    handleWebhook(webhookData: any, authHeader?: string): Promise<any>;
}
