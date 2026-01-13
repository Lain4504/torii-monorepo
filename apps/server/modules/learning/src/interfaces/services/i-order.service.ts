import type {
    OrderCreateDTO,
    OrderQueryDTO,
    OrderResponseDTO,
    OrderConfirmDTO,
    PaginatedResponseDTO,
    PaymentQueryDTO,
    PaymentResponseDTO,
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
     * Find all payments with pagination and filters
     */
    findAllPayments(query: PaymentQueryDTO): Promise<PaginatedResponseDTO<PaymentResponseDTO>>;

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
     * Handle Payment Webhook (e.g. PayOS)
     */
    handleWebhook(webhookData: any, authHeader?: string): Promise<any>;
}
