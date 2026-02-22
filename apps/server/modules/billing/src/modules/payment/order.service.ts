import { Injectable, Logger, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
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
import type { IOrderService } from '@server/billing/interfaces/services';
import { OrderRepository } from './order.repository';
import { PayOSService } from './payos.service';
import { CouponService } from '@server/billing/modules';
import type { Prisma } from '@prisma/generated';
import { lastValueFrom } from 'rxjs';
import { AppConfigService } from '@server/shared';

/**
 * Order Service
 * Handles order business logic operations
 */
@Injectable()
export class OrderService implements IOrderService {
    private readonly logger = new Logger(OrderService.name);

    constructor(
        private readonly appConfig: AppConfigService,
        private readonly orderRepository: OrderRepository,
        private readonly payOSService: PayOSService,
        private readonly couponService: CouponService,
        @Inject('NATS_SERVICE')
        private readonly natsClient: ClientProxy,
    ) { }

    /**
     * Logic to auto-cancel pending orders that are older than 30 minutes
     */
    async autoCancelExpiredOrders() {
        try {
            const thirtyMinutesAgo = new Date();
            thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);

            const count = await this.orderRepository.updateMany(
                {
                    status: OrderStatus.PENDING,
                    createdAt: {
                        lt: thirtyMinutesAgo,
                    },
                },
                {
                    status: OrderStatus.TIMED_OUT,
                },
            );

            if (count > 0) {
                this.logger.log(`Auto-cancelled ${count} pending orders`);
                // Find those orders to clean up enrollments
                const expiredOrders = await this.orderRepository.findMany({
                    where: {
                        status: OrderStatus.TIMED_OUT,
                        updatedAt: { gte: thirtyMinutesAgo } // Approximate
                    },
                    take: count,
                    skip: 0
                });

                for (const order of expiredOrders) {
                    if (order.enrollmentId && (order.metadata as any)?.courseId) {
                        this.natsClient.send({ cmd: 'learning.enrollment.delete' }, {
                            userId: order.userId,
                            courseId: (order.metadata as any).courseId
                        }).subscribe(); // Fire and forget but using standard pattern
                    }
                }
            }
        } catch (error: any) {
            this.logger.error(`Error in auto-cancel orders logic: ${error.message}`, error.stack);
            throw error;
        }
    }

    private toOrderDto(o: any): OrderResponseDTO {
        return {
            id: o.id,
            userId: o.userId,
            userEmail: o.user?.email,
            userName: o.user?.displayName,
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
            const { page = 1, limit = 10, userId, status, startDate, endDate } = query;
            const pageNum = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
            const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;
            const validPage = pageNum > 0 ? pageNum : 1;
            const validLimit = limitNum > 0 ? limitNum : 10;
            const skip = (validPage - 1) * validLimit;

            const whereClause: Prisma.OrderWhereInput = {};
            if (userId) whereClause.userId = userId;
            if (status) whereClause.status = status as any;

            if (startDate || endDate) {
                whereClause.createdAt = {};
                if (startDate) {
                    const date = new Date(startDate);
                    if (!isNaN(date.getTime())) {
                        whereClause.createdAt.gte = date;
                    }
                }
                if (endDate) {
                    const date = new Date(endDate);
                    if (!isNaN(date.getTime())) {
                        whereClause.createdAt.lte = date;
                    }
                }
            }

            const [total, items] = await Promise.all([
                this.orderRepository.count(whereClause),
                this.orderRepository.findMany({
                    where: whereClause,
                    take: validLimit,
                    skip,
                    orderBy: { createdAt: 'desc' },
                    include: { user: true },
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
        this.logger.log(`[OrderService] Creating order for user: ${userId} with input: ${JSON.stringify(input)}`);

        let amount = 0;
        let course: any = null;

        const courseId = input.courseId || input.metadata?.courseId;
        let originalAmount: number | undefined;
        let discountAmount: number | undefined;

        if (input.orderType === OrderType.COURSE_PURCHASE && courseId) {
            // Fetch course via NATS
            try {
                course = await lastValueFrom(
                    this.natsClient.send({ cmd: 'learning.course.findOne' }, { id: courseId })
                );
            } catch (error: any) {
                this.logger.error(`Error calling learning.course.findOne: ${error.message}`);
                course = null;
            }

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

            if (course && (amount === 0 || course.isFree)) {
                this.logger.log(`Course ${courseId} is free, skipping order creation. calculatedAmount=${amount}, isFree=${course.isFree}`);
                throw new BadRequestException('Free courses do not require payment');
            }
        } else if (input.orderType === OrderType.TOP_UP) {
            amount = Number((input as any).amount);
            if (!amount || amount <= 0) {
                throw new BadRequestException('Amount is required for top-up and must be positive');
            }
            this.logger.log(`Creating top-up order for user ${userId}: amount=${amount}`);

        } else if (!courseId && input.orderType === OrderType.COURSE_PURCHASE) {
            throw new BadRequestException('CourseId is required for course_purchase order type');
        }

        // Handle Gift Order Validation
        if (input.orderType === OrderType.GIFT || (input.metadata && input.metadata.isGift)) {
            const recipientEmail = input.metadata?.recipientEmail;
            if (!recipientEmail) {
                throw new BadRequestException('Recipient email is required for gift orders');
            }

            if (recipientEmail === (await this.orderRepository.getUserById(userId))?.email) {
                throw new BadRequestException('You cannot gift a course to yourself');
            }

            try {
                // Verify recipient exists
                const identityResponse = await lastValueFrom(
                    this.natsClient.send({ cmd: 'identity.users.findOne' }, { email: recipientEmail })
                );

                if (!identityResponse || !identityResponse.user) {
                    throw new BadRequestException(`Recipient with email ${recipientEmail} not found`);
                }

                // Check if recipient already owns the course
                const isAlreadyOwned = await lastValueFrom(
                    this.natsClient.send({ cmd: 'learning.enrollment.isEnrolled' }, {
                        userId: identityResponse.user.id,
                        courseId: courseId,
                    })
                );

                if (isAlreadyOwned) {
                    throw new BadRequestException('Recipient already owns this course');
                }

                // Store recipient ID in metadata for later use
                input.metadata = {
                    ...input.metadata,
                    recipientId: identityResponse.user.id,
                    recipientName: identityResponse.user.displayName,
                };

            } catch (error: any) {
                if (error instanceof BadRequestException) {
                    throw error;
                }
                this.logger.error(`Error validating gift recipient: ${error.message}`);
                throw new BadRequestException(`Invalid recipient email: ${recipientEmail}`);
            }
        }

        // Handle Coupon Redemption (Distributed Lock)
        let couponId: string | undefined;
        let couponDiscount = 0;

        if (input.couponCode) {
            this.logger.log(`[OrderService] Attempting to redeem coupon: ${input.couponCode}`);
            try {
                // Redeem coupon - this increments usage count safely
                const redemption = await this.couponService.redeemCoupon(input.couponCode, userId, amount);
                couponId = redemption.couponId;
                couponDiscount = redemption.discountAmount;

                // Recalculate amount
                amount = Math.max(0, amount - couponDiscount);

                this.logger.log(`Coupon ${input.couponCode} applied. Discount: ${couponDiscount}. Final Amount: ${amount}`);
            } catch (error: any) {
                this.logger.warn(`Failed to apply coupon ${input.couponCode}: ${error.message}`);
                throw new BadRequestException(`Coupon error: ${error.message}`);
            }
        } else {
            this.logger.log(`[OrderService] No coupon code provided in input.`);
        }

        try {
            const metadata = {
                ...input.metadata,
                courseId: courseId,
                ...(originalAmount !== undefined && { originalAmount }),
                ...(discountAmount !== undefined && { discountAmount: (discountAmount || 0) + couponDiscount }), // Combine course discount and coupon discount
                couponCode: input.couponCode,
                couponDiscount: couponDiscount,
            };

            // Create Enrollment in PENDING_PAYMENT status
            let enrollmentId: string | undefined;
            if (input.orderType === OrderType.COURSE_PURCHASE && courseId && !input.metadata?.isGift) {
                try {
                    const enrollment = await lastValueFrom(
                        this.natsClient.send({ cmd: 'learning.enrollment.create' }, {
                            userId,
                            courseId,
                            status: 'pending_payment', // Use string literal to avoid import issue if enum not updated in context
                            finalPrice: amount
                        })
                    );
                    enrollmentId = enrollment?.id;
                    this.logger.log(`Created pending enrollment ${enrollmentId} for order`);
                } catch (e: any) {
                    this.logger.error(`Failed to create pending enrollment: ${e.message}`);
                    // Should we block order creation? strict consistency says yes.
                    throw new BadRequestException(`Failed to initialize enrollment: ${e.message}`);
                }
            }

            const created = await this.orderRepository.create({
                user: { connect: { id: userId } },
                amount,
                currency: 'VND',
                paymentMethod: input.paymentMethod || 'mock',
                paymentGateway: input.paymentGateway || 'mock',
                status: OrderStatus.PENDING,
                orderType: input.orderType || OrderType.COURSE_PURCHASE,
                description: input.description || undefined,
                enrollmentId: enrollmentId,
                coupon: couponId ? { connect: { id: couponId } } : undefined,
                metadata,
            });

            // Update enrollment with orderId if it exists
            if (enrollmentId) {
                this.natsClient.emit({ cmd: 'learning.enrollment.updateOrderId' }, {
                    id: enrollmentId,
                    orderId: created.id
                });
            }

            // If PayOS payment method, create payment link
            if (input.paymentMethod === PaymentMethod.PAYOS) {
                try {
                    const orderCode = Number(Date.now().toString().slice(-10));
                    const description = `Torii ${orderCode}`;
                    const frontendUrl = this.appConfig.identity.frontendUrl;
                    const returnUrl = input.metadata?.returnUrl || (input as any).returnUrl || `${frontendUrl}/checkout/return?order_id=${created.id}`;
                    const cancelUrl = input.metadata?.cancelUrl || (input as any).cancelUrl || `${frontendUrl}/checkout/return?order_id=${created.id}`;

                    const paymentLinkData = await this.payOSService.createPaymentLink({
                        orderCode: orderCode,
                        amount: Number(created.amount),
                        description: description,
                        cancelUrl: cancelUrl,
                        returnUrl: returnUrl,
                    });

                    // Update order with transaction info
                    await this.orderRepository.update(created.id, {
                        transactionId: orderCode.toString(),
                        gatewayTransactionId: orderCode.toString(),
                        metadata: {
                            ...(created.metadata as any),
                            checkoutUrl: paymentLinkData.checkoutUrl,
                            paymentLinkId: paymentLinkData.paymentLinkId,
                            payOsOrderCode: orderCode,
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
                    // If payment link creation fails, also rollback coupon!
                    if (couponId) {
                        await this.couponService.releaseCoupon(couponId);
                    }
                    // Also delete the created order? Or mark as failed?
                    // For now mark as failed is safer than delete
                    await this.orderRepository.update(created.id, {
                        status: OrderStatus.FAILED,
                        failedAt: new Date(),
                        metadata: {
                            ...(created.metadata as any),
                            failureReason: `PayOS Init Error: ${error.message}`
                        }
                    });

                    throw new BadRequestException(`Failed to initialize payment gateway: ${error.message}`);
                }
            }

            return this.toOrderDto(created);

        } catch (dbError: any) {
            // DB Creation failed
            if (couponId) {
                await this.couponService.releaseCoupon(couponId);
            }
            throw dbError;
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
            return this.toOrderDto(order);
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
            if ((order.orderType === OrderType.COURSE_PURCHASE || order.orderType === OrderType.GIFT) && metadata?.courseId) {
                try {
                    // Check if it's a gift
                    const isGift = order.orderType === OrderType.GIFT || !!metadata.isGift;
                    const targetUserId = isGift ? metadata.recipientId : order.userId;

                    if (isGift && !targetUserId) {
                        this.logger.error(`Gift order ${orderId} missing recipientId in metadata`);
                        throw new BadRequestException('Gift order missing recipient information');
                    }

                    let enrollmentId: string | undefined;

                    if (isGift) {
                        // Gift Flow: Always create new enrollment (Active)
                        const enrollmentPayload = {
                            userId: targetUserId,
                            courseId: metadata.courseId,
                            isGift: isGift,
                            giftMessage: metadata.giftMessage,
                            senderId: isGift ? order.userId : undefined,
                            // status: 'in_progress' - REMOVED: EnrollmentService will force pending_payment for paid courses
                        };

                        const enrollment = await lastValueFrom(
                            this.natsClient.send({ cmd: 'learning.enrollment.create' }, enrollmentPayload)
                        );
                        enrollmentId = enrollment?.id;

                        this.logger.log(`Gift enrollment created for user ${targetUserId} and course ${metadata.courseId} (ID: ${enrollment?.id})`);

                        // Activate the gift enrollment immediately (since payment is confirmed)
                        if (enrollmentId) {
                            await lastValueFrom(
                                this.natsClient.send({ cmd: 'learning.enrollment.activate' }, { enrollmentId })
                            );
                            this.logger.log(`Activated gift enrollment ${enrollmentId}`);
                        }
                    } else {
                        // Regular Flow: Activate existing enrollment
                        enrollmentId = order.enrollmentId ?? undefined;

                        if (!enrollmentId) {
                            // Backward compatibility: create if missing
                            this.logger.warn(`Order ${orderId} missing enrollmentId, attempting to create/find...`);
                            const enrollmentPayload = {
                                userId: targetUserId,
                                courseId: metadata.courseId,
                                status: 'in_progress'
                            };
                            const enrollment = await lastValueFrom(
                                this.natsClient.send({ cmd: 'learning.enrollment.create' }, enrollmentPayload)
                            );
                            enrollmentId = enrollment?.id;
                        } else {
                            // Activate existing
                            await lastValueFrom(
                                this.natsClient.send({ cmd: 'learning.enrollment.activate' }, { enrollmentId })
                            );
                            this.logger.log(`Activated enrollment ${enrollmentId} for order ${orderId}`);
                        }
                    }

                    // Update order with enrollmentId if we resolved/created it
                    if (enrollmentId && enrollmentId !== order.enrollmentId) {
                        await this.orderRepository.update(orderId, {
                            enrollmentId: enrollmentId,
                        });
                        // Update enrollment with orderId
                        await lastValueFrom(
                            this.natsClient.send({ cmd: 'learning.enrollment.updateOrderId' }, {
                                id: enrollmentId,
                                orderId: orderId,
                            })
                        );
                    }

                    // Emit order_payment_success event
                    try {
                        const course = await lastValueFrom(
                            this.natsClient.send({ cmd: 'learning.course.findOne' }, { id: metadata.courseId })
                        );
                        const user = await this.orderRepository.getUserById(order.userId);

                        if (course && user) {
                            this.natsClient.emit({ cmd: 'order_payment_success' }, {
                                userId: order.userId,
                                userEmail: user.email,
                                userName: user.displayName || user.email || 'User',
                                orderId: order.id,
                                courseId: course.id,
                                courseName: course.title,
                                amount: Number(order.amount),
                                currency: order.currency,
                                isGift: isGift,
                                recipientName: metadata.recipientName,
                            });
                            this.logger.log(`order_payment_success event emitted for order ${orderId}`);

                            if (isGift && targetUserId) {
                                const recipientUser = await this.orderRepository.getUserById(targetUserId);
                                if (recipientUser) {
                                    this.natsClient.emit({ cmd: 'course_gift_received' }, {
                                        recipientId: targetUserId,
                                        recipientEmail: recipientUser.email,
                                        senderId: order.userId,
                                        senderName: user.displayName || user.email || 'A friend',
                                        courseId: course.id,
                                        courseName: course.title,
                                        giftMessage: metadata.giftMessage,
                                        enrollmentId: enrollmentId,
                                    });
                                    this.logger.log(`course_gift_received event emitted for recipient ${recipientUser.email}`);
                                }
                            }
                        }
                    } catch (eventError: any) {
                        this.logger.error(`Failed to emit payment success event: ${eventError.message}`);
                    }
                } catch (enrollError: any) {
                    this.logger.warn(`Failed to create/activate enrollment after payment: ${enrollError.message}`);
                }
            }

            this.logger.log(`Order ${orderId} confirmed successfully`);

            // Handle TOP_UP logic
            if (order.orderType === OrderType.TOP_UP) {
                try {
                    await lastValueFrom(
                        this.natsClient.send({ cmd: 'billing.user_balance.add' }, {
                            userId: order.userId,
                            amount: Math.round(Number(order.amount)),
                            reason: `Nạp tiền vào tài khoản (Đơn hàng #${order.id})`,
                            type: 'TOP_UP',
                            metadata: { orderId: order.id }
                        })
                    );
                    this.logger.log(`User ${order.userId} account credited with ${order.amount} balance`);
                } catch (balanceError: any) {
                    this.logger.error(`Failed to credit balance for top-up: ${balanceError.message}`);
                }
            }

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

            if (order.couponId) {
                await this.couponService.releaseCoupon(order.couponId);
            }

            this.logger.error(`Error confirming order: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Handle PayOS Webhook
     */
    async handleWebhook(webhookData: any): Promise<any> {
        const { orderCode, amount, code, desc } = webhookData;
        const payOsOrderCode = orderCode.toString();
        const order = await this.orderRepository.findByTransactionId(payOsOrderCode);

        if (!order) {
            this.logger.warn(`Order not found for PayOS OrderCode: ${payOsOrderCode}`);
            return { success: true, message: 'Order not found' };
        }

        if (code !== '00') {
            this.logger.warn(`PayOS transaction failed/cancelled: ${desc} (Code: ${code}, OrderCode: ${orderCode})`);

            if (order.status === OrderStatus.PENDING) {
                await this.orderRepository.update(order.id, {
                    status: OrderStatus.FAILED,
                    failedAt: new Date(),
                    metadata: {
                        ...(order.metadata as Record<string, any>),
                        failureReason: desc,
                        webhookCode: code
                    }
                });

                if (order.couponId) {
                    await this.couponService.releaseCoupon(order.couponId);
                }
            }
            return { success: true, message: 'Transaction failed' };
        }

        // Logic for success case (code === '00')
        try {
            await this.orderRepository.createPayment({
                order: { connect: { id: order.id } },
                user: { connect: { id: order.userId } },
                transactionId: payOsOrderCode,
                gateway: 'payos',
                amount: amount.toString(),
                currency: 'VND',
                content: desc || 'PayOS Webhook',
                status: order.status === OrderStatus.COMPLETED ? 'duplicate' : 'success',
                rawResponse: webhookData,
                processedAt: new Date(),
            });
        } catch (txError) {
            this.logger.error(`Failed to save payment transaction log: ${txError}`);
        }

        if (Number(amount) < Number(order.amount)) {
            this.logger.warn(`Payment amount mismatch for ${order.id}. Expected ${order.amount}, got ${amount}`);
            return { success: true, message: 'Amount mismatch' };
        }

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
    /**
     * Cancel an order
     */
    async cancel(id: string, userId: string, userRole: string): Promise<OrderResponseDTO> {
        const order = await this.orderRepository.findById(id);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        // Only owner or admin can cancel
        if (order.userId !== userId && userRole !== 'admin') {
            throw new BadRequestException('You do not have permission to cancel this order');
        }

        // Only pending orders can be cancelled manually
        if (order.status !== OrderStatus.PENDING) {
            throw new BadRequestException(`Cannot cancel order in ${order.status} status`);
        }

        const updated = await this.orderRepository.update(id, {
            status: OrderStatus.CANCELLED,
            metadata: {
                ...(order.metadata as Record<string, any>),
                cancelledBy: userId,
                cancelledAt: new Date().toISOString()
            }
        });

        // Clean up enrollment if any
        const courseId = (order.metadata as any)?.courseId;
        if (order.enrollmentId && courseId) {
            this.natsClient.send({ cmd: 'learning.enrollment.delete' }, {
                userId: order.userId,
                courseId: courseId
            }).subscribe();
        }

        // Release coupon if any
        if (order.couponId) {
            await this.couponService.releaseCoupon(order.couponId);
        }

        // Notify other modules via NATS
        this.natsClient.emit({ cmd: 'billing.order.cancelled' }, {
            orderId: id,
            userId: order.userId,
            enrollmentId: order.enrollmentId
        });

        return this.toOrderDto(updated);
    }

    /**
     * Refund an order (Admin only/System only)
     */
    async refund(id: string, reason?: string): Promise<OrderResponseDTO> {
        const order = await this.orderRepository.findById(id);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.status !== OrderStatus.COMPLETED) {
            throw new BadRequestException('Only completed orders can be refunded');
        }

        const updated = await this.orderRepository.update(id, {
            status: OrderStatus.REFUNDED as any,
            metadata: {
                ...(order.metadata as Record<string, any>),
                refundedAt: new Date().toISOString(),
                refundReason: reason
            }
        });

        const metadata = order.metadata as Record<string, any>;
        const courseId = metadata?.courseId;

        // 1. Thu hồi quyền truy cập (Un-enroll)
        if (courseId) {
            try {
                const deletedEnrollment = await lastValueFrom(
                    this.natsClient.send({ cmd: 'learning.enrollment.delete' }, {
                        userId: order.userId,
                        courseId: courseId
                    })
                );

                // 2. Hoàn tiền nếu là giao dịch có phí
                if (deletedEnrollment && deletedEnrollment.finalPrice > 0) {
                    await lastValueFrom(
                        this.natsClient.send({ cmd: 'billing.user_balance.add' }, {
                            userId: order.userId,
                            amount: Math.round(Number(deletedEnrollment.finalPrice)),
                            reason: `Hoàn tiền đơn hàng #${order.id}. ${reason || ''}`
                        })
                    );
                }
            } catch (error: any) {
                this.logger.error(`Failed to process un-enrollment/refund logic properly: ${error.message}`);
                // We still proceed since order status is already updated
            }
        }

        // 3. Thông báo qua NATS
        this.natsClient.emit({ cmd: 'billing.order.refunded' }, {
            orderId: id,
            userId: order.userId,
            reason
        });

        return this.toOrderDto(updated);
    }
}
