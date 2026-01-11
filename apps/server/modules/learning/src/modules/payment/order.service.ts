import { Injectable, Logger, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import {
    type OrderCreateDTO,
    type OrderQueryDTO,
    type OrderResponseDTO,
    type OrderConfirmDTO,
    type PaginatedResponseDTO,
    OrderStatus,
    OrderType,
    PaymentMethod,
} from '@workspace/schemas';
import type { IOrderService } from '../../interfaces/services';
import { ORDER_SERVICE_TOKEN, ENROLLMENT_SERVICE_TOKEN } from '../../interfaces/services';
import type { IEnrollmentService } from '../../interfaces/services';
import { OrderRepository } from './order.repository';
import { SePayService } from './sepay.service';
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
        private readonly sePayService: SePayService,
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
        if (input.orderType === OrderType.COURSE_PURCHASE && courseId) {
            course = await this.courseRepository.findById(courseId);
            if (!course) {
                throw new NotFoundException('Course not found');
            }

            amount = course.discountPrice ? Number(course.discountPrice) : Number(course.price);

            if (amount === 0 || course.isFree) {
                this.logger.log(`Course ${courseId} is free, skipping order creation`);
                throw new BadRequestException('Free courses do not require payment');
            }
        } else if (!courseId && input.orderType === OrderType.COURSE_PURCHASE) {
            throw new BadRequestException('CourseId is required for course_purchase order type');
        }

        try {
            const originalAmount = courseId && course?.discountPrice
                ? Number(course.price)
                : undefined;
            const discountAmount = courseId && course?.discountPrice
                ? Number(course.price) - Number(course.discountPrice)
                : undefined;

            const metadata = {
                ...input.metadata,
                courseId: courseId,
                ...(originalAmount && { originalAmount }),
                ...(discountAmount && { discountAmount }),
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

            // If SePay payment method, create QR code
            if (input.paymentMethod === PaymentMethod.SEPAY) {
                try {
                    const paymentRef = created.id.split('-')[0].toUpperCase();
                    const description = `PAY ${paymentRef}`;

                    const qrCodeUrl = this.sePayService.generateQrCode({
                        amount: Number(created.amount),
                        description: description,
                    });

                    // Update order with transaction info
                    await this.orderRepository.update(created.id, {
                        transactionId: paymentRef,
                        metadata: {
                            ...(created.metadata as any),
                            qrCode: qrCodeUrl,
                            paymentRef: paymentRef,
                        }
                    });

                    return {
                        ...this.toOrderDto(created),
                        qrCode: qrCodeUrl,
                        paymentMethod: PaymentMethod.SEPAY,
                    };
                } catch (error: any) {
                    this.logger.error(`Failed to create SePay QR: ${error.message}`);
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
            throw new BadRequestException('Order already completed');
        }

        if (order.status === OrderStatus.FAILED || order.status === OrderStatus.CANCELLED) {
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
     * Handle SePay Webhook
     */
    async handleWebhook(webhookData: any, authHeader?: string): Promise<any> {
        try {
            if (authHeader) {
                this.sePayService.verifyWebhook(webhookData, authHeader);
            }

            const { content, transferAmount, referenceCode, id } = webhookData;

            const match = content?.match(/PAY\s+([A-Z0-9]+)/i);
            const paymentRef = match ? match[1].toUpperCase() : 'UNKNOWN';

            // Find order by transactionId (short ref)
            const order = match ? await this.orderRepository.findByTransactionId(paymentRef) : null;

            // Save actual Payment record (Transaction log)
            try {
                await this.orderRepository.createPayment({
                    order: order ? { connect: { id: order.id } } : undefined,
                    transactionId: referenceCode || id.toString(),
                    gateway: 'sepay',
                    amount: transferAmount,
                    currency: 'VND',
                    content: content,
                    status: order ? (order.status === OrderStatus.COMPLETED ? 'duplicate' : 'success') : 'orphan',
                    rawResponse: webhookData,
                    processedAt: new Date(),
                });
            } catch (txError) {
                this.logger.error(`Failed to save payment transaction log: ${txError}`);
            }

            if (!order) {
                this.logger.warn(`Order not found for SePay ref: ${paymentRef}`);
                return { success: true, message: 'Order not found' };
            }

            if (order.status === OrderStatus.COMPLETED) {
                return { success: true, message: 'Already completed' };
            }

            if (Number(transferAmount) < Number(order.amount)) {
                this.logger.warn(`Payment amount mismatch for ${order.id}. Expected ${order.amount}, got ${transferAmount}`);
                return { success: true, message: 'Amount mismatch' };
            }

            // Confirm order
            await this.confirm(order.id, {
                orderId: order.id,
                transactionId: referenceCode || id.toString(),
                gatewayTransactionId: id.toString(),
                metadata: {
                    ...webhookData,
                    sepayWebhookReceivedAt: new Date().toISOString()
                }
            });

            return { success: true };
        } catch (error: any) {
            this.logger.error(`Error handling webhook: ${error.message}`, error.stack);
            return { success: false, error: error.message };
        }
    }
}
