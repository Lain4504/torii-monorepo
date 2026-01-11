import type {
    PaymentCreateDTO,
    PaymentQueryDTO,
    PaymentResponseDTO,
    PaymentConfirmDTO,
    PaginatedResponseDTO,
} from '@workspace/schemas';

/**
 * Payment Service Interface
 * Defines the contract for payment business logic operations
 */
export interface IPaymentService {
    /**
     * Find all payments with pagination and filters
     */
    findAll(query: PaymentQueryDTO): Promise<PaginatedResponseDTO<PaymentResponseDTO>>;

    /**
     * Find payment by ID
     */
    findOne(id: string): Promise<PaymentResponseDTO | null>;

    /**
     * Create a new payment (mock implementation)
     */
    create(userId: string, input: PaymentCreateDTO): Promise<PaymentResponseDTO>;

    /**
     * Confirm/complete payment (mock implementation)
     */
    confirm(paymentId: string, input: PaymentConfirmDTO): Promise<PaymentResponseDTO>;

    /**
     * Handle PayOS Webhook
     */
    handleWebhook(webhookData: any, authHeader?: string): Promise<any>;
}

