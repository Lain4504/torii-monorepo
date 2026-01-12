import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { Order, Payment, Prisma } from '@prisma/generated';
import type { IOrderRepository } from '../../interfaces/repositories';

/**
 * Order Repository
 * Handles all database operations for Order and Payment entities
 */
@Injectable()
export class OrderRepository implements IOrderRepository {
    private readonly logger = new Logger(OrderRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Find order by ID
     */
    async findById(id: string): Promise<Order | null> {
        return this.prisma.order.findUnique({
            where: { id },
        });
    }

    /**
     * Find order by transaction ID (SePay Ref)
     */
    async findByTransactionId(transactionId: string): Promise<Order | null> {
        return this.prisma.order.findFirst({
            where: { transactionId },
        });
    }

    /**
     * Find all orders with pagination and filters
     */
    async findMany(options: {
        skip: number;
        take: number;
        where?: Prisma.OrderWhereInput;
        orderBy?: Prisma.OrderOrderByWithRelationInput;
    }): Promise<Order[]> {
        return this.prisma.order.findMany({
            where: options.where,
            skip: options.skip,
            take: options.take,
            orderBy: options.orderBy || { createdAt: 'desc' },
        });
    }

    /**
     * Count orders with optional filter
     */
    async count(where?: Prisma.OrderWhereInput): Promise<number> {
        return this.prisma.order.count({
            where,
        });
    }

    /**
     * Create a new order
     */
    async create(data: Prisma.OrderCreateInput): Promise<Order> {
        return this.prisma.order.create({
            data,
        });
    }

    /**
     * Update order
     */
    async update(id: string, data: Prisma.OrderUpdateInput): Promise<Order> {
        return this.prisma.order.update({
            where: { id },
            data,
        });
    }

    /**
     * Delete order by ID
     */
    async delete(id: string): Promise<void> {
        await this.prisma.order.delete({
            where: { id },
        });
    }

    /**
     * Create a payment log (transaction receipt)
     */
    async createPayment(data: Prisma.PaymentCreateInput): Promise<Payment> {
        return this.prisma.payment.create({
            data,
        });
    }

    /**
     * Find payment by transaction ID
     */
    async findPaymentByTransactionId(transactionId: string): Promise<Payment | null> {
        return this.prisma.payment.findFirst({
            where: { transactionId },
        });
    }
}
