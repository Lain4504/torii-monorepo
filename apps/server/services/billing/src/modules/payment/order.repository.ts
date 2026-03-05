import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { Order, Payment, Prisma } from '@prisma/generated';
import type { IOrderRepository } from '@server/billing/interfaces/repositories';

/**
 * Order Repository
 * Handles all database operations for Order and Payment entities
 */
@Injectable()
export class OrderRepository implements IOrderRepository {
  private readonly logger = new Logger(OrderRepository.name);

  constructor(private readonly prisma: PrismaService) {}

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
      where: {
        transactionId: {
          equals: transactionId,
          mode: 'insensitive',
        },
      },
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
    include?: Prisma.OrderInclude;
  }): Promise<any[]> {
    return this.prisma.order.findMany({
      where: options.where,
      skip: options.skip,
      take: options.take,
      orderBy: options.orderBy || { createdAt: 'desc' },
      include: options.include,
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
   * Aggregate orders (e.g., sum amount)
   */
  async aggregate(
    where: Prisma.OrderWhereInput,
    aggregate: Prisma.OrderAggregateArgs,
  ) {
    return this.prisma.order.aggregate({
      where,
      ...aggregate,
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
  async findPaymentByTransactionId(
    transactionId: string,
  ): Promise<Payment | null> {
    return this.prisma.payment.findFirst({
      where: { transactionId },
    });
  }

  /**
   * Find all payments with pagination and filters
   */
  async findManyPayments(options: {
    skip: number;
    take: number;
    where?: Prisma.PaymentWhereInput;
    orderBy?: Prisma.PaymentOrderByWithRelationInput;
  }): Promise<Payment[]> {
    return this.prisma.payment.findMany({
      where: options.where,
      skip: options.skip,
      take: options.take,
      orderBy: options.orderBy || { processedAt: 'desc' },
    });
  }

  /**
   * Count payments with optional filter
   */
  async countPayments(where?: Prisma.PaymentWhereInput): Promise<number> {
    return this.prisma.payment.count({
      where,
    });
  }

  /**
   * Update multiple orders
   */
  async updateMany(
    where: Prisma.OrderWhereInput,
    data: Prisma.OrderUpdateManyMutationInput,
  ): Promise<number> {
    const result = await this.prisma.order.updateMany({
      where,
      data,
    });
    return result.count;
  }

  /**
   * Get user by ID (for notification purposes)
   */
  async getUserById(
    userId: string,
  ): Promise<{ id: string; email: string; displayName: string | null } | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
      },
    });
  }
}
