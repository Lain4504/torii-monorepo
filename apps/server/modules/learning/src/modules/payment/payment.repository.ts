import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { Payment, Prisma } from '@prisma/generated';
import type { IPaymentRepository } from '../../interfaces/repositories';

/**
 * Payment Repository
 * Handles all database operations for Payment entity
 */
@Injectable()
export class PaymentRepository implements IPaymentRepository {
    private readonly logger = new Logger(PaymentRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Find payment by ID
     */
    async findById(id: string): Promise<Payment | null> {
        return this.prisma.payment.findUnique({
            where: { id },
        });
    }

    /**
     * Find payment by transaction ID
     */
    async findByTransactionId(transactionId: string): Promise<Payment | null> {
        return this.prisma.payment.findFirst({
            where: { transactionId },
        });
    }

    /**
     * Find all payments with pagination and filters
     */
    async findMany(options: {
        skip: number;
        take: number;
        where?: Prisma.PaymentWhereInput;
        orderBy?: Prisma.PaymentOrderByWithRelationInput;
    }): Promise<Payment[]> {
        return this.prisma.payment.findMany({
            where: options.where,
            skip: options.skip,
            take: options.take,
            orderBy: options.orderBy || { createdAt: 'desc' },
        });
    }

    /**
     * Count payments with optional filter
     */
    async count(where?: Prisma.PaymentWhereInput): Promise<number> {
        return this.prisma.payment.count({
            where,
        });
    }

    /**
     * Create a new payment
     */
    async create(data: Prisma.PaymentCreateInput): Promise<Payment> {
        return this.prisma.payment.create({
            data,
        });
    }

    /**
     * Update payment
     */
    async update(id: string, data: Prisma.PaymentUpdateInput): Promise<Payment> {
        return this.prisma.payment.update({
            where: { id },
            data,
        });
    }

    /**
     * Delete payment by ID
     */
    async delete(id: string): Promise<void> {
        await this.prisma.payment.delete({
            where: { id },
        });
    }
}

