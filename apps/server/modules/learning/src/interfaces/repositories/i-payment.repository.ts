import type { Payment, Prisma } from '@prisma/generated';

/**
 * Payment Repository Interface
 * Defines the contract for all payment data access operations
 */
export interface IPaymentRepository {
    /**
     * Find payment by ID
     */
    findById(id: string): Promise<Payment | null>;

    /**
     * Find payment by transaction ID
     */
    findByTransactionId(transactionId: string): Promise<Payment | null>;

    /**
     * Find all payments with pagination and filters
     */
    findMany(options: {
        skip: number;
        take: number;
        where?: Prisma.PaymentWhereInput;
        orderBy?: Prisma.PaymentOrderByWithRelationInput;
    }): Promise<Payment[]>;

    /**
     * Count payments with optional filter
     */
    count(where?: Prisma.PaymentWhereInput): Promise<number>;

    /**
     * Create a new payment
     */
    create(data: Prisma.PaymentCreateInput): Promise<Payment>;

    /**
     * Update payment
     */
    update(id: string, data: Prisma.PaymentUpdateInput): Promise<Payment>;

    /**
     * Delete payment by ID
     */
    delete(id: string): Promise<void>;
}

