
import { Injectable, Logger, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import {
    type OrderCreateDTO,
    type OrderQueryDTO,
    type OrderResponseDTO,
    type OrderConfirmDTO,
    type PaginatedResponseDTO,
    PaymentQueryDTO,
    PaymentResponseDTO,
    OrderStatus,
    OrderType,
    PaymentMethod,
} from '@workspace/schemas';
import type { IOrderService } from '../../interfaces/services';
import { ORDER_SERVICE_TOKEN, ENROLLMENT_SERVICE_TOKEN } from '../../interfaces/services';
import type { IEnrollmentService } from '../../interfaces/services';
import { OrderRepository } from './order.repository';
import { PayOSService } from './payos.service';
import { ICourseRepository, COURSE_REPOSITORY_TOKEN } from '../../interfaces/repositories';
import type { Prisma } from '@prisma/generated';

/**
 * Order Service
 * Handles order business logic operations (formerly Payment Service)
 */
@Injectable()
export class OrderService implements IOrderService {
    private readonly logger = new Logger(OrderService.name);

    constructor(
        private readonly orderRepository: OrderRepository,
        @Inject(COURSE_REPOSITORY_TOKEN)
        private readonly courseRepository: ICourseRepository,
        @Inject(ENROLLMENT_SERVICE_TOKEN)
        private readonly enrollmentService: IEnrollmentService,
        private readonly payOSService: PayOSService,
    ) { }

    private toOrderDto(o: any): OrderResponseDTO {
        return {
            id: o.id,
            userId: o.userId,
            amount: Number(o.amount),
            currency: o.currency,
            paymentMethod: o.paymentMethod as PaymentMethod,
            paymentGateway: o.paymentGateway || undefined,
            transactionId: o.transactionId || undefined,
            gatewayTransactionId: o.gatewayTransactionId || undefined,
            status: o.status as OrderStatus,
            orderType: o.orderType as OrderType,
            enrollmentId: o.enrollmentId || undefined,
            couponId: o.couponId || undefined,
            description: o.description || undefined,
            metadata: o.metadata || {},
            completedAt: o.completedAt || undefined,
            failedAt: o.failedAt || undefined,
            createdAt: o.createdAt,
            updatedAt: o.updatedAt,
        };
    }

    private toPaymentDto(p: any): PaymentResponseDTO {
        return {
            id: p.id,
            orderId: p.orderId || undefined,
            transactionId: p.transactionId || undefined,
            gateway: p.gateway || undefined,
            amount: p.amount ? Number(p.amount) : undefined,
            currency: p.currency,
            content: p.content || undefined,
            status: p.status || undefined,
            rawResponse: p.rawResponse || {},
            processedAt: p.processedAt,
        };
    }

    /**
     * Find all orders with pagination and filters
     */
    async findAll(query: OrderQueryDTO): Promise<PaginatedResponseDTO<OrderResponseDTO>> {
        try {
            const { page = 1, limit = 10, userId, courseId, status } = query;
            const pageNum = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
            const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;
            const validPage = pageNum > 0 ? pageNum : 1;
            const validLimit = limitNum > 0 ? limitNum : 10;
            const skip = (validPage - 1) * validLimit;

            const whereClause: Prisma.OrderWhereInput = {};
            if (userId) whereClause.userId = userId;
            if (status) whereClause.status = status as any;

            const [total, items] = await Promise.all([
                this.orderRepository.count(whereClause),
                this.orderRepository.findMany({
                    where: whereClause,
                    take: validLimit,
                    skip,
                    orderBy: { createdAt: 'desc' },
                }),
            ]);

            const totalPages = Math.ceil(total / validLimit);

            return {
                data: items.map((i) => this.toOrderDto(i)),
                total,
                page: validPage,
                limit: validLimit,
                totalPages,
            };
        } catch (error: any) {
            this.logger.error(`Error fetching orders: ${error.message}`, error.stack);
            return {
                data: [],
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
            };
        }
    }

    /**
     * Find all payments with pagination and filters
     */
    async findAllPayments(query: PaymentQueryDTO): Promise<PaginatedResponseDTO<PaymentResponseDTO>> {
        try {
            const { page = 1, limit = 10, userId, orderId, status, transactionId } = query;
            const pageNum = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
            const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;
            const validPage = pageNum > 0 ? pageNum : 1;
            const validLimit = limitNum > 0 ? limitNum : 10;
            const skip = (validPage - 1) * validLimit;

            const whereClause: Prisma.PaymentWhereInput = {};
            if (userId) whereClause.userId = userId;
            if (orderId) whereClause.orderId = orderId;
            if (status) whereClause.status = status;
            if (transactionId) whereClause.transactionId = transactionId;

            const [total, items] = await Promise.all([
                this.orderRepository.countPayments(whereClause),
                this.orderRepository.findManyPayments({
                    where: whereClause,
                    take: validLimit,
                    skip,
                    orderBy: { processedAt: 'desc' },
                }),
            ]);

            const totalPages = Math.ceil(total / validLimit);

            return {
                data: items.map((i) => this.toPaymentDto(i)),
                total,
                page: validPage,
                limit: validLimit,
                totalPages,
            };
        } catch (error: any) {
            this.logger.error(`Error fetching payments: ${error.message}`, error.stack);
            return {
                data: [],
                total: 0,
                page: 1,
                limit: 10,
                totalPages: 0,
            };
        }
    }

    /**
     * Find order by ID
     */
    async findOne(id: string): Promise<OrderResponseDTO | null> {
        try {
            const item = await this.orderRepository.findById(id);
            if (!item) return null;
            return this.toOrderDto(item);
        } catch (error: any) {
            this.logger.error(`Error fetching order ${id}: ${error.message}`, error.stack);
            return null;
        }
    }

    /**
     * Create a new order
     */
    async create(userId: string, input: OrderCreateDTO): Promise<OrderResponseDTO> {
        let amount = 0;
        let course: any = null;

        const courseId = input.courseId || input.metadata?.courseId;
        let originalAmount: number | undefined;
        let discountAmount: number | undefined;

        if (input.orderType === OrderType.COURSE_PURCHASE && courseId) {
            course = await this.courseRepository.findById(courseId);
            if (!course) {
                this.logger.error(`Course not found: ${courseId}`);
                throw new NotFoundException('Course not found');
            }

            const hasDiscount = course.discountPrice !== null && course.discountPrice !== undefined;
            amount = hasDiscount ? Number(course.discountPrice) : Number(course.price);

            if (hasDiscount) {
                originalAmount = Number(course.price);
                discountAmount = originalAmount - amount;
            }

            this.logger.log(`Creating order for course ${courseId}: price=${course.price}, discountPrice=${course.discountPrice}, calculatedAmount=${amount}, isFree=${course.isFree}`);

            if (amount === 0 || course.isFree) {
                this.logger.log(`Course ${courseId} is free, skipping order creation. calculatedAmount=${amount}, isFree=${course.isFree}`);
                throw new BadRequestException('Free courses do not require payment');
            }
        } else if (!courseId && input.orderType === OrderType.COURSE_PURCHASE) {
            throw new BadRequestException('CourseId is required for course_purchase order type');
        }

        try {
            const metadata = {
                ...input.metadata,
                courseId: courseId,
                ...(originalAmount !== undefined && { originalAmount }),
                ...(discountAmount !== undefined && { discountAmount }),
            };

            const created = await this.orderRepository.create({
                user: { connect: { id: userId } },
                amount,
                currency: 'VND',
                paymentMethod: input.paymentMethod || 'mock',
                paymentGateway: input.paymentGateway || 'mock',
                status: OrderStatus.PENDING,
                orderType: input.orderType || OrderType.COURSE_PURCHASE,
                description: input.description || undefined,
                metadata,
            });

            // If PayOS payment method, create payment link
            if (input.paymentMethod === PaymentMethod.PAYOS) {
                try {
                    // Generate a unique order code for PayOS
                    // PayOS requires integer orderCode (max 53-bit).
                    // We use Date.now() (13 digits) slice(-10) to keep it safe and shorter (max 10 digits fit in int32 easily)
                    const orderCode = Number(Date.now().toString().slice(-10));

                    // PayOS description max length is 25 characters.
                    const description = `Torii ${orderCode}`;

                    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

                    // Prefer URLs from metadata, fallback to default
                    const returnUrl = input.metadata?.returnUrl || (input as any).returnUrl || `${frontendUrl}/checkout/return?order_id=${created.id}`;
                    const cancelUrl = input.metadata?.cancelUrl || (input as any).cancelUrl || `${frontendUrl}/checkout/return?order_id=${created.id}`;

                    const paymentLinkData = await this.payOSService.createPaymentLink({
                        orderCode: orderCode,
                        amount: Number(created.amount),
                        description: description,
                        cancelUrl: cancelUrl,
                        returnUrl: returnUrl,
                        // items removed to prevent validation errors with PayOS
                    });

                    // Update order with transaction info
                    await this.orderRepository.update(created.id, {
                        transactionId: orderCode.toString(),
                        gatewayTransactionId: orderCode.toString(), // Storing the numeric ID as string
                        metadata: {
                            ...(created.metadata as any),
                            checkoutUrl: paymentLinkData.checkoutUrl,
                            paymentLinkId: paymentLinkData.paymentLinkId,
                            payOsOrderCode: orderCode, // Keep numeric reference too if needed
                        }
                    });

                    this.logger.log(`Created PayOS payment link for order ${created.id}: ${paymentLinkData.checkoutUrl}`);

                    return {
                        ...this.toOrderDto(created),
                        transactionId: orderCode.toString(),
                        metadata: {
                            ...(created.metadata as any),
                            checkoutUrl: paymentLinkData.checkoutUrl,
                            paymentLinkId: paymentLinkData.paymentLinkId,
                        },
                        paymentMethod: PaymentMethod.PAYOS,
                    };
                } catch (error: any) {
                    this.logger.error(`Failed to create PayOS payment link: ${error.message}`);
                    throw new BadRequestException(`Failed to initialize payment gateway: ${error.message}`);
                }
            }

            return this.toOrderDto(created);
        } catch (error: any) {
            this.logger.error(`Error creating order: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Confirm/complete order
     */
    async confirm(orderId: string, input: OrderConfirmDTO): Promise<OrderResponseDTO> {
        const order = await this.orderRepository.findById(orderId);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.status === OrderStatus.COMPLETED) {
            // Check if already completed to avoid error, just return it
            return this.toOrderDto(order);
        }

        if (order.status === OrderStatus.FAILED || order.status === OrderStatus.CANCELLED) {
            // If we are getting a success webhook for a failed order, we might want to "revive" it or just log.
            // For now, strict check.
            throw new BadRequestException('Order cannot be confirmed in current status');
        }

        try {
            const transactionId = input.transactionId || `MOCK-${Date.now()}-${orderId.substring(0, 8)}`;

            const updated = await this.orderRepository.update(orderId, {
                status: OrderStatus.COMPLETED,
                transactionId,
                gatewayTransactionId: input.gatewayTransactionId,
                completedAt: new Date(),
                metadata: input.metadata ? { ...(order.metadata as Record<string, any> || {}), ...input.metadata } : (order.metadata as any) || {},
            });

            const metadata = order.metadata as Record<string, any>;
            if (order.orderType === OrderType.COURSE_PURCHASE && metadata?.courseId) {
                try {
                    const enrollment = await this.enrollmentService.create(order.userId, {
                        courseId: metadata.courseId,
                    });

                    // Link order to enrollment
                    await this.enrollmentService.updateOrderId(enrollment.id, orderId);

                    // Update order with enrollmentId
                    await this.orderRepository.update(orderId, {
                        enrollmentId: enrollment.id,
                    });

                    this.logger.log(`Enrollment created automatically for user ${order.userId} and course ${metadata.courseId}`);
                } catch (enrollError: any) {
                    if (enrollError?.message?.includes('Already enrolled')) {
                        this.logger.log(`User ${order.userId} is already enrolled in course ${metadata.courseId}`);
                    } else {
                        this.logger.warn(`Failed to create enrollment after payment: ${enrollError.message}`);
                    }
                }
            }

            this.logger.log(`Order ${orderId} confirmed successfully`);
            return this.toOrderDto(updated);
        } catch (error: any) {
            await this.orderRepository.update(orderId, {
                status: OrderStatus.FAILED,
                failedAt: new Date(),
                metadata: {
                    ...(order.metadata as Record<string, any>),
                    failureReason: error.message,
                },
            });

            this.logger.error(`Error confirming order: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Handle PayOS Webhook
     */
    async handleWebhook(webhookData: any): Promise<any> {
        // Data is already verified by controller
        const { orderCode, amount, code, desc } = webhookData;

        // 1. Check transaction status
        if (code !== '00') {
            this.logger.warn(`PayOS transaction failed/cancelled: ${desc} (Code: ${code}, OrderCode: ${orderCode})`);
            // Optionally fail the order here
            return { success: true, message: 'Transaction failed' };
        }

        // 2. Identify order
        const payOsOrderCode = orderCode.toString();
        const order = await this.orderRepository.findByTransactionId(payOsOrderCode);

        // 3. Save actual Payment record (Transaction log)
        try {
            await this.orderRepository.createPayment({
                order: order ? { connect: { id: order.id } } : undefined,
                user: order ? { connect: { id: order.userId } } : undefined,
                transactionId: payOsOrderCode,
                gateway: 'payos',
                amount: amount.toString(),
                currency: 'VND',
                content: desc || 'PayOS Webhook',
                status: order ? (order.status === OrderStatus.COMPLETED ? 'duplicate' : 'success') : 'orphan',
                rawResponse: webhookData,
                processedAt: new Date(),
            });
        } catch (txError) {
            this.logger.error(`Failed to save payment transaction log: ${txError}`);
        }

        if (!order) {
            this.logger.warn(`Order not found for PayOS OrderCode: ${payOsOrderCode}`);
            return { success: true, message: 'Order not found' };
        }

        // 4. Validate Amount
        if (Number(amount) < Number(order.amount)) {
            this.logger.warn(`Payment amount mismatch for ${order.id}. Expected ${order.amount}, got ${amount}`);
            return { success: true, message: 'Amount mismatch' };
        }

        // 5. Confirm order
        try {
            await this.confirm(order.id, {
                orderId: order.id,
                transactionId: payOsOrderCode,
                gatewayTransactionId: payOsOrderCode,
                metadata: {
                    ...webhookData,
                    webhookReceivedAt: new Date().toISOString()
                }
            });

            return { success: true };
        } catch (error: any) {
            this.logger.error(`Error handling webhook: ${error.message}`, error.stack);
            return { success: false, error: error.message };
        }
    }
}
