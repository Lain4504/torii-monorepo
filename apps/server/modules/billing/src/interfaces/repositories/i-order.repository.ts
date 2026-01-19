import type { Order, Payment, Prisma } from '@prisma/generated';

/**
 * Order Repository Interface
 * Defines the contract for all order data access operations
 */
export interface IOrderRepository {
    /**
     * Find order by ID
     */
    findById(id: string): Promise<Order | null>;

    /**
     * Find order by transaction ID (SePay Ref)
     */
    findByTransactionId(transactionId: string): Promise<Order | null>;

    /**
     * Find all orders with pagination and filters
     */
    findMany(options: {
        skip: number;
        take: number;
        where?: Prisma.OrderWhereInput;
        orderBy?: Prisma.OrderOrderByWithRelationInput;
    }): Promise<Order[]>;

    /**
     * Count orders with optional filter
     */
    count(where?: Prisma.OrderWhereInput): Promise<number>;

    /**
     * Create a new order
     */
    create(data: Prisma.OrderCreateInput): Promise<Order>;

    /**
     * Update order
     */
    update(id: string, data: Prisma.OrderUpdateInput): Promise<Order>;

    /**
     * Delete order by ID
     */
    delete(id: string): Promise<void>;

    /**
     * Create a payment log (transaction receipt)
     */
    createPayment(data: Prisma.PaymentCreateInput): Promise<Payment>;

    /**
     * Find payment by transaction ID
     */
    findPaymentByTransactionId(transactionId: string): Promise<Payment | null>;

    /**
     * Find all payments with pagination and filters
     */
    findManyPayments(options: {
        skip: number;
        take: number;
        where?: Prisma.PaymentWhereInput;
        orderBy?: Prisma.PaymentOrderByWithRelationInput;
    }): Promise<Payment[]>;

    /**
     * Count payments with optional filter
     */
    countPayments(where?: Prisma.PaymentWhereInput): Promise<number>;

    /**
     * Get user by ID (for notification purposes)
     */
    getUserById(userId: string): Promise<{ id: string; email: string; displayName: string | null } | null>;
}
