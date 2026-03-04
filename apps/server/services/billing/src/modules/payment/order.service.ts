import { Injectable, Logger, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectMapper } from '@automapper/nestjs';
import type { Mapper } from '@automapper/core';
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
    PaymentGateway,
} from '@workspace/schemas';
import type { IOrderService } from '@server/billing/interfaces/services';
import { OrderRepository } from './order.repository';
import { PayOSService } from './payos.service';
import { CouponService } from '@server/billing/modules/coupon/coupon.service';
import { UserBalanceService } from '@server/billing/modules/user-balance/user-balance.service';
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
        @InjectMapper()
        private readonly mapper: Mapper,
        private readonly userBalanceService: UserBalanceService,
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
                    if (order.enrollmentId && (order.metadata as any)?.courseRunId) {
                        this.natsClient.send({ cmd: 'learning.enrollment.delete' }, {
                            userId: order.userId,
                            courseRunId: (order.metadata as any).courseRunId
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
        return this.mapper.map(o, 'Order', 'OrderResponseDTO');
    }

    private toPaymentDto(p: any): PaymentResponseDTO {
        return this.mapper.map(p, 'Payment', 'PaymentResponseDTO');
    }

    /**
     * Find all orders with pagination and filters
     */
    async findAll(query: OrderQueryDTO): Promise<PaginatedResponseDTO<OrderResponseDTO>> {
        try {
            const { page = 1, limit = 10, userId, status, startDate, endDate, search } = query;
            const pageNum = typeof page === 'string' ? parseInt(page, 10) : Number(page) || 1;
            const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : Number(limit) || 10;
            const validPage = pageNum > 0 ? pageNum : 1;
            const validLimit = limitNum > 0 ? limitNum : 10;
            const skip = (validPage - 1) * validLimit;

            const whereClause: Prisma.OrderWhereInput = {};
            if (userId) whereClause.userId = userId;
            if (status) whereClause.status = status as any;

            // Add search functionality
            if (search && search.trim().length > 0) {
                const searchOR: any[] = [
                    { user: { email: { contains: search, mode: 'insensitive' } } },
                    { user: { displayName: { contains: search, mode: 'insensitive' } } },
                ];

                // UUID fields (id, userId) only support exact match
                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
                if (uuidRegex.test(search.trim())) {
                    searchOR.push({ id: search.trim() });
                    searchOR.push({ userId: search.trim() });
                }

                whereClause.OR = searchOR;
            }

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

            const response = {
                data: items.map((i) => this.toOrderDto(i)),
                total,
                page: validPage,
                limit: validLimit,
                totalPages,
            };

            return response;
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
     * Get order statistics
     */
    async getStats(query: OrderQueryDTO): Promise<{ totalRevenue: number; orderCount: number }> {
        try {
            const { userId, status, startDate, endDate } = query;
            const whereClause: Prisma.OrderWhereInput = {
                status: (status || OrderStatus.COMPLETED) as any
            };

            if (userId) whereClause.userId = userId;

            if (startDate || endDate) {
                whereClause.createdAt = {};
                if (startDate) {
                    const date = new Date(startDate);
                    if (!isNaN(date.getTime())) whereClause.createdAt.gte = date;
                }
                if (endDate) {
                    const date = new Date(endDate);
                    if (!isNaN(date.getTime())) whereClause.createdAt.lte = date;
                }
            }

            const stats = await this.orderRepository.aggregate(
                whereClause,
                { _sum: { amount: true }, _count: true }
            );

            return {
                totalRevenue: Number(stats._sum?.amount || 0),
                orderCount: (stats._count as any) || 0,
            };
        } catch (error: any) {
            this.logger.error(`Error fetching order stats: ${error.message}`, error.stack);
            return { totalRevenue: 0, orderCount: 0 };
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
    async findById(id: string): Promise<OrderResponseDTO | null> {
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

        // Enforcement of new flow:
        // 1. TOP_UP must use PAYOS
        // 2. COURSE_PURCHASE must use BALANCE
        if (input.orderType === OrderType.TOP_UP && input.paymentMethod !== PaymentMethod.PAYOS) {
            throw new BadRequestException('Nạp tiền vào tài khoản chỉ hỗ trợ qua phương thức PayOS');
        }

        if (input.orderType === OrderType.COURSE_PURCHASE &&
            input.paymentMethod !== PaymentMethod.BALANCE) {
            throw new BadRequestException('Mua khóa học chỉ hỗ trợ thanh toán bằng Coin (Số dư ví Torii)');
        }

        let amount = 0;
        let course: any = null;
        let courseRun: any = null;
        let courseMasterId: string | undefined;

        const courseRunId = input.courseRunId;

        let originalAmount: number | undefined;
        let discountAmount: number | undefined;

        if (input.orderType === OrderType.COURSE_PURCHASE && courseRunId) {
            // 1. Fetch details based on what's being purchased
            if (courseRunId) {
                try {
                    courseRun = await lastValueFrom(
                        this.natsClient.send({ cmd: 'learning.courserun.findById' }, { id: courseRunId })
                    );
                    if (courseRun) {
                        // Use run price if available, otherwise we'll need the master
                        amount = courseRun.price ? Number(courseRun.price) : 0;
                        if (courseRun.discountPrice) {
                            originalAmount = amount;
                            amount = Number(courseRun.discountPrice);
                            discountAmount = originalAmount - amount;
                        }
                    }
                } catch (error: any) {
                    this.logger.error(`Error calling learning.courserun.findById: ${error.message}`);
                }
            }

            // Always fetch master for metadata/fallback
            const fetchMasterId = courseRun?.courseMasterId;
            courseMasterId = fetchMasterId;
            if (fetchMasterId) {
                try {
                    course = await lastValueFrom(
                        this.natsClient.send({ cmd: 'learning.coursemaster.findById' }, { id: fetchMasterId })
                    );
                } catch (error: any) {
                    this.logger.error(`Error calling learning.coursemaster.findById: ${error.message}`);
                }
            }

            if (!course && !courseRun) {
                this.logger.error(`Product not found: run=${courseRunId}`);
                throw new NotFoundException('Product not found');
            }

            // Finalize amount logic
            if (courseRun) {
                // amount already determined from courseRun fetch logic above
                this.logger.log(`Creating order for run: ${courseRunId}, finalAmount=${amount}`);
            } else {
                throw new BadRequestException('CourseRunId is required for course purchases');
            }

            this.logger.log(`Creating order for course: run=${courseRunId}, finalAmount=${amount}`);
        } else if (input.orderType === OrderType.TOP_UP) {
            amount = Number((input as any).amount);
            if (!amount || amount <= 0) {
                throw new BadRequestException('Amount is required for top-up and must be positive');
            }
            this.logger.log(`Creating top-up order for user ${userId}: amount=${amount}`);

        } else if (!courseRunId && input.orderType === OrderType.COURSE_PURCHASE) {
            throw new BadRequestException('CourseRunId is required for course_purchase order type');
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
                    this.natsClient.send({ cmd: 'identity.users.findByEmail' }, { email: recipientEmail })
                );

                if (!identityResponse || !identityResponse.user) {
                    throw new BadRequestException(`Recipient with email ${recipientEmail} not found`);
                }

                // Check if recipient already owns the course
                const isAlreadyOwned = await lastValueFrom(
                    this.natsClient.send({ cmd: 'learning.enrollment.isEnrolled' }, {
                        userId: identityResponse.user.id,
                        courseMasterId,
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
                const redemption = await this.couponService.redeemCoupon(input.couponCode, userId, amount, courseMasterId, courseRunId);
                couponId = redemption.couponId;
                couponDiscount = redemption.discountAmount;

                // Validation as per user rule: system doesn't support coupons greater than or equal to course price
                if (couponDiscount >= amount) {
                    // Release the coupon since redemption succeeded but we are rejecting the order flow
                    await this.couponService.releaseCoupon(couponId);
                    throw new BadRequestException('Mã giảm giá không hợp lệ cho đơn hàng này (Giá trị khuyến mãi phải nhỏ hơn giá khóa học)');
                }

                // Recalculate amount
                amount = Math.round(amount - couponDiscount);

                this.logger.log(`Coupon ${input.couponCode} applied. Discount: ${couponDiscount}. Final Amount: ${amount}`);
            } catch (error: any) {
                this.logger.warn(`Failed to apply coupon ${input.couponCode}: ${error.message}`);
                throw error instanceof BadRequestException ? error : new BadRequestException(`Coupon error: ${error.message}`);
            }
        } else {
            this.logger.log(`[OrderService] No coupon code provided in input.`);
        }

        try {
            const metadata = {
                ...input.metadata,
                courseRunId,
                courseMasterId,
                ...(originalAmount !== undefined && { originalAmount }),
                ...(discountAmount !== undefined && { discountAmount: (discountAmount || 0) + couponDiscount }), // Combine course discount and coupon discount
                couponCode: input.couponCode,
                couponDiscount: couponDiscount,
            };

            // Create Enrollment in PENDING_PAYMENT status
            let enrollmentId: string | undefined;
            if (input.orderType === OrderType.COURSE_PURCHASE && courseRunId && !input.metadata?.isGift) {
                try {
                    const enrollment = await lastValueFrom(
                        this.natsClient.send({ cmd: 'learning.enrollment.create' }, {
                            userId,
                            courseRunId,
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
                paymentMethod: input.paymentMethod || PaymentMethod.BALANCE,
                paymentGateway: input.paymentGateway || (input.paymentMethod === PaymentMethod.PAYOS ? PaymentGateway.PAYOS : PaymentGateway.BALANCE),
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
                    const webLearnerUrl = this.appConfig.identity.webLearnerUrl;
                    const returnUrl = input.metadata?.returnUrl || (input as any).returnUrl || `${webLearnerUrl}/checkout/return?order_id=${created.id}`;
                    const cancelUrl = input.metadata?.cancelUrl || (input as any).cancelUrl || `${webLearnerUrl}/checkout/return?order_id=${created.id}`;

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

            // Handle BALANCE payment immediately if requested
            if (input.paymentMethod === PaymentMethod.BALANCE && created.orderType === OrderType.COURSE_PURCHASE) {
                return this.payWithBalance(created.id, userId);
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
            const transactionId = input.transactionId || `PAY-${Date.now()}-${orderId.substring(0, 8)}`;

            const updated = await this.orderRepository.update(orderId, {
                status: OrderStatus.COMPLETED,
                transactionId,
                gatewayTransactionId: input.gatewayTransactionId,
                completedAt: new Date(),
                metadata: input.metadata ? { ...(order.metadata as Record<string, any> || {}), ...input.metadata } : (order.metadata as any) || {},
            });

            const metadata = order.metadata as Record<string, any>;
            if ((order.orderType === OrderType.COURSE_PURCHASE || order.orderType === OrderType.GIFT) && metadata?.courseMasterId) {
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
                            courseRunId: metadata.courseRunId,
                            isGift: isGift,
                            giftMessage: metadata.giftMessage,
                            senderId: isGift ? order.userId : undefined,
                        };

                        const enrollment = await lastValueFrom(
                            this.natsClient.send({ cmd: 'learning.enrollment.create' }, enrollmentPayload)
                        );
                        enrollmentId = enrollment?.id;

                        this.logger.log(`Gift enrollment created for user ${targetUserId} and run ${metadata.courseRunId} (ID: ${enrollment?.id})`);

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
                                courseRunId: metadata.courseRunId,
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
                            this.natsClient.send({ cmd: 'learning.coursemaster.findById' }, { id: metadata.courseMasterId })
                        );
                        const user = await this.orderRepository.getUserById(order.userId);

                        if (course && user) {
                            this.natsClient.emit({ cmd: 'order_payment_success' }, {
                                userId: order.userId,
                                userEmail: user.email,
                                userName: user.displayName || user.email || 'User',
                                orderId: order.id,
                                courseMasterId: course.id,
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
                                        courseMasterId: course.id,
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
        // Handle PayOS webhook data. 
        // Note: webhookData might be the full body OR just the verified 'data' portion
        const orderCode = webhookData.orderCode;
        const amount = webhookData.amount;
        const code = webhookData.code || '00'; // Assume success if code is missing but data is verified
        const desc = webhookData.desc || webhookData.description || 'Success';

        if (!orderCode) {
            this.logger.error(`Webhook data missing orderCode: ${JSON.stringify(webhookData)}`);
            return { success: false, message: 'Missing orderCode' };
        }

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

        // Only pending or processing orders can be cancelled manually
        if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.PROCESSING) {
            throw new BadRequestException(`Cannot cancel order in ${order.status} status`);
        }
        this.logger.log(`Cancelling order ${id} with status ${order.status} by user ${userId} (role: ${userRole})`);

        const updated = await this.orderRepository.update(id, {
            status: OrderStatus.CANCELLED,
            metadata: {
                ...(order.metadata as Record<string, any>),
                cancelledBy: userId,
                cancelledAt: new Date().toISOString()
            }
        });

        // Clean up enrollment if any
        const courseRunId = (order.metadata as any)?.courseRunId;
        if (order.enrollmentId && courseRunId) {
            this.natsClient.send({ cmd: 'learning.enrollment.delete' }, {
                userId: order.userId,
                courseRunId: courseRunId
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

        // 1. Update original order status to REFUNDED (to mark it as net-zero)
        await this.orderRepository.update(id, {
            status: OrderStatus.REFUNDED as any,
            metadata: {
                ...(order.metadata as Record<string, any>),
                refundedAt: new Date().toISOString(),
                refundReason: reason
            }
        });

        // 2. Create a NEW Order of type REFUND to track the historic return event
        const refundOrder = await this.orderRepository.create({
            user: { connect: { id: order.userId } },
            amount: order.amount,
            currency: order.currency,
            paymentMethod: order.paymentMethod,
            paymentGateway: order.paymentGateway,
            status: OrderStatus.COMPLETED as any, // The refund "transaction" itself is successful
            orderType: 'refund' as any,
            transactionId: `REFUND-${order.transactionId || order.id.slice(0, 8)}`,
            description: `Hoàn tiền: ${order.description}`,
            metadata: {
                originalOrderId: order.id,
                refundReason: reason,
                courseRunId: (order.metadata as any)?.courseRunId,
                courseMasterId: (order.metadata as any)?.courseMasterId
            },
            completedAt: new Date(),
        });

        const metadata = order.metadata as Record<string, any>;
        const courseRunId = metadata?.courseRunId;

        // 3. Un-enroll and Add Balance
        if (courseRunId) {
            try {
                const deletedEnrollment = await lastValueFrom(
                    this.natsClient.send({ cmd: 'learning.enrollment.delete' }, {
                        userId: order.userId,
                        courseRunId: courseRunId
                    })
                );

                if (deletedEnrollment && deletedEnrollment.finalPrice > 0) {
                    await lastValueFrom(
                        this.natsClient.send({ cmd: 'billing.user_balance.add' }, {
                            userId: order.userId,
                            amount: Math.round(Number(deletedEnrollment.finalPrice)),
                            reason: `Hoàn tiền đơn hàng #${order.id}. ${reason || ''}`,
                            type: 'REFUND',
                            metadata: {
                                orderId: order.id,
                                refundOrderId: refundOrder.id
                            }
                        })
                    );
                }
            } catch (error: any) {
                this.logger.error(`Failed to process un-enrollment/refund logic properly: ${error.message}`);
                // Proceed since order status is updated
            }
        }

        // 4. Emit event
        this.natsClient.emit({ cmd: 'billing.order.refunded' }, {
            orderId: id,
            refundOrderId: refundOrder.id,
            userId: order.userId,
            reason
        });

        return this.toOrderDto(refundOrder);
    }

    /**
     * Export orders based on query filters (for admin)
     * Returns raw data for CSV/Excel export
     */
    async exportOrders(query: OrderQueryDTO): Promise<any[]> {
        try {
            const whereClause: Prisma.OrderWhereInput = {};
            if (query.userId) whereClause.userId = query.userId;
            if (query.status) whereClause.status = query.status as any;
            if (query.search) {
                const searchFilters: Prisma.OrderWhereInput[] = [
                    { user: { displayName: { contains: query.search, mode: 'insensitive' } } },
                    { user: { email: { contains: query.search, mode: 'insensitive' } } },
                ];

                // If it looks like a UUID, search by ID
                if (query.search.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                    searchFilters.push({ id: query.search });
                }

                whereClause.OR = searchFilters;
            }

            if (query.startDate || query.endDate) {
                whereClause.createdAt = {};
                if (query.startDate) {
                    const date = new Date(query.startDate);
                    if (!isNaN(date.getTime())) {
                        whereClause.createdAt.gte = date;
                    }
                }
                if (query.endDate) {
                    const date = new Date(query.endDate);
                    if (!isNaN(date.getTime())) {
                        date.setHours(23, 59, 59, 999); // End of the day
                        whereClause.createdAt.lte = date;
                    }
                }
            }

            const orders = await this.orderRepository.findMany({
                where: whereClause,
                take: 999999, // A very large number to get all for export, or remove take/skip entirely
                skip: 0,
                orderBy: { createdAt: 'desc' },
                include: { user: true, coupon: true }, // Include user and coupon for more data
            });

            return orders.map(order => ({
                orderId: order.id,
                userId: order.userId,
                userName: order.user?.displayName || order.user?.email,
                userEmail: order.user?.email,
                amount: Number(order.amount),
                currency: order.currency,
                status: order.status,
                orderType: order.orderType,
                paymentMethod: order.paymentMethod,
                paymentGateway: order.paymentGateway,
                transactionId: order.transactionId,
                gatewayTransactionId: order.gatewayTransactionId,
                enrollmentId: order.enrollmentId,
                couponCode: order.coupon?.code,
                couponDiscount: order.metadata ? (order.metadata as any).couponDiscount || 0 : 0,
                originalCourseAmount: order.metadata ? (order.metadata as any).originalAmount || Number(order.amount) : Number(order.amount),
                createdAt: order.createdAt.toISOString(),
                completedAt: order.completedAt?.toISOString() || '',
                cancelledAt: (order.metadata as any)?.cancelledAt || '',
                // Add more fields as needed for export
            }));

        } catch (error: any) {
            this.logger.error(`Error exporting orders: ${error.message}`, error.stack);
            throw error;
        }
    }

    /**
     * Pay order using user balance (Coins)
     */
    async payWithBalance(orderId: string, userId: string): Promise<OrderResponseDTO> {
        const order = await this.orderRepository.findById(orderId);
        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.userId !== userId) {
            throw new BadRequestException('Unauthorized to pay for this order');
        }

        if (order.status !== OrderStatus.PENDING) {
            throw new BadRequestException(`Order is already ${order.status}`);
        }

        if (order.orderType !== OrderType.COURSE_PURCHASE && order.orderType !== OrderType.GIFT) {
            throw new BadRequestException('Balance payment is only available for course purchases');
        }

        const amountNum = Number(order.amount);

        try {
            // 1. Check & Deduct Balance
            await this.userBalanceService.deductBalance(
                userId,
                amountNum,
                `Thanh toán khóa học (Đơn hàng #${order.id})`,
                'PURCHASE' as any,
                { orderId: order.id }
            );

            // 2. Confirm Order (This will trigger Enrollment activation)
            return this.confirm(order.id, {
                orderId: order.id,
                transactionId: `WALLETPAY-${Date.now()}`,
                gatewayTransactionId: `WALLET-${order.id}`,
                metadata: { paymentSource: 'wallet' }
            });

        } catch (error: any) {
            this.logger.error(`Balance payment failed for order ${orderId}: ${error.message}`);
            // If deduction failed (insufficient balance), we keep order as PENDING
            // The frontend can then show "Insufficient balance"
            throw error;
        }
    }
}
