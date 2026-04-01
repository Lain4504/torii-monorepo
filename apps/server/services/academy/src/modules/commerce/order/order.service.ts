import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { OrderStatus, PaymentMethod, PaymentGateway } from '@prisma/generated';
import { CouponService } from '../coupon.service';
import { PayOSService } from '../payos.service';
import { EnrollmentService } from '../../classroom/enrollment/enrollment.service';
import { AuditLoggerService } from '../../audit-logger.service';
import { OrderCheckoutDto, OrderPreviewDto } from './dto/order.dto';
import { Prisma } from '@prisma/generated';
import { AppConfigService } from '@server/shared';
import { ClientProxy } from '@nestjs/microservices';
import { AiSubscriptionService } from '../quota/ai-subscription.service';
import * as ExcelJS from 'exceljs';


@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly couponService: CouponService,
    private readonly payOS: PayOSService,
    private readonly enrollmentService: EnrollmentService,
    private readonly appConfig: AppConfigService,
    private readonly audit: AuditLoggerService,
    private readonly aiSubscriptionService: AiSubscriptionService,
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  async preview(userId: string, input: OrderPreviewDto) {
    const vodPackageIds = Array.from(new Set(input.vodPackageIds ?? []));
    const cohortIds = Array.from(new Set(input.cohortIds ?? []));
    const subscriptionPlanIds = Array.from(
      new Set(input.subscriptionPlanIds ?? []),
    );
    const now = new Date();

    if (
      !vodPackageIds.length &&
      !cohortIds.length &&
      !subscriptionPlanIds.length
    ) {
      throw new BadRequestException('At least one product must be provided');
    }

    const vodPackages = vodPackageIds.length
      ? await this.prisma.vodPackage.findMany({
          where: { id: { in: vodPackageIds }, status: 'PUBLISHED' },
          include: { courseProfile: true },
        })
      : [];
    if (vodPackages.length !== vodPackageIds.length)
      throw new BadRequestException('Some VOD Packages are not available');

    const cohorts = cohortIds.length
      ? await this.prisma.cohort.findMany({
          where: { id: { in: cohortIds }, status: 'OPENING' },
          include: { courseProfile: true },
        })
      : [];
    if (cohorts.length !== cohortIds.length)
      throw new BadRequestException('Some Cohorts are not available');

    for (const vod of vodPackages) {
      const existing = await this.prisma.enrollment.findFirst({
        where: {
          userId,
          status: { in: ['ACTIVE', 'COMPLETED'] },
          vodPackageId: vod.id,
        },
      });
      if (existing) throw new BadRequestException('Bạn đã sở hữu gói VOD này');
    }

    for (const cohort of cohorts) {
      if (
        !cohort.enrollmentOpenAt ||
        !cohort.enrollmentCloseAt ||
        new Date(cohort.enrollmentOpenAt) > now ||
        new Date(cohort.enrollmentCloseAt) < now
      ) {
        throw new BadRequestException(
          'Đợt học hiện không trong thời gian đăng ký.',
        );
      }

      const existing = await this.prisma.enrollment.findFirst({
        where: {
          userId,
          status: { in: ['ACTIVE', 'COMPLETED'] },
          liveClass: { cohortId: cohort.id },
        },
      });
      if (existing)
        throw new BadRequestException(
          `Bạn đã đăng ký đợt học ${cohort.name} rồi`,
        );

      const selectedLiveClassId = input.liveClassIdByCohort?.[cohort.id];
      if (!selectedLiveClassId)
        throw new BadRequestException('Vui lòng chọn lớp Live');

      const liveClass = await this.prisma.liveClass.findUnique({
        where: { id: selectedLiveClassId },
      });
      if (!liveClass || liveClass.cohortId !== cohort.id)
        throw new BadRequestException('Lớp Live không hợp lệ.');

      if (liveClass.maxStudents) {
        const count = await this.prisma.enrollment.count({
          where: { liveClassId: liveClass.id, status: 'ACTIVE' },
        });
        if (count >= liveClass.maxStudents)
          throw new BadRequestException('Lớp đã đủ học viên.');
      }
    }

    const subscriptionPlans = subscriptionPlanIds.length
      ? await this.prisma.aiSubscriptionPlan.findMany({
          where: { id: { in: subscriptionPlanIds }, isActive: true },
        })
      : [];
    if (subscriptionPlans.length !== subscriptionPlanIds.length)
      throw new BadRequestException(
        'Some subscription plans are not available',
      );

    const subTotal =
      vodPackages.reduce(
        (sum, v) => sum + Number(v.discountPrice ?? v.price),
        0,
      ) +
      cohorts.reduce((sum, c) => sum + Number(c.discountPrice ?? c.price), 0) +
      subscriptionPlans.reduce((sum, s) => sum + Number(s.price), 0);

    let discountTotal = 0;
    let couponId: string | undefined;

    if (input.couponCode) {
      const allProductIds = [...vodPackageIds, ...cohortIds];
      const coupon = await this.couponService.validateCoupon(
        input.couponCode,
        userId,
        subTotal,
        allProductIds,
      );
      discountTotal = await this.couponService.calculateDiscount(
        coupon.id,
        subTotal,
      );
      couponId = coupon.id;
    }

    const grandTotal = Math.max(0, subTotal - discountTotal);

    return {
      subTotal,
      discountTotal,
      grandTotal,
      vodPackages,
      cohorts,
      subscriptionPlans,
      couponId,
      inputLiveClassMap: input.liveClassIdByCohort,
    };
  }

  async checkout(userId: string, input: OrderCheckoutDto) {
    this.logger.log('Academy Checkout User');
    const preview = await this.preview(userId, input);

    const orderCode = this.generateOrderCode();
    const orderItemsData = [
      ...preview.vodPackages.map((v: any) => ({
        vodPackageId: v.id,
        price: v.discountPrice ?? v.price,
        offeringSnapshot: {
          title: v.title,
          code: v.code,
          mode: 'VOD',
          basePrice: v.price,
          isDiscounted: !!v.discountPrice,
        } as any,
      })),
      ...preview.cohorts.map((c: any) => ({
        cohortId: c.id,
        price: c.discountPrice ?? c.price,
        offeringSnapshot: {
          title: c.name,
          code: c.code,
          mode: 'LIVE',
          selectedClassId: preview.inputLiveClassMap?.[c.id],
          basePrice: c.price,
          isDiscounted: !!c.discountPrice,
        } as any,
      })),
      ...preview.subscriptionPlans.map((s: any) => ({
        subscriptionPlanId: s.id,
        price: s.price,
        offeringSnapshot: {
          title: s.name,
          code: s.code,
          isSubscription: true,
          basePrice: s.price,
        } as any,
      })),
    ];

    const order = await this.prisma.order.create({
      data: {
        code: orderCode,
        userId,
        status: OrderStatus.PENDING,
        subTotal: new Prisma.Decimal(preview.subTotal),
        discountTotal: new Prisma.Decimal(preview.discountTotal),
        grandTotal: new Prisma.Decimal(preview.grandTotal),
        currency: 'VND', // Default
        couponCode: input.couponCode,
        couponId: preview.couponId,
        paymentMethod: input.paymentMethod,
        metadata: input.metadata || {},
        items: { create: orderItemsData },
      },
      include: { items: true },
    });

    await this.audit.log({
      userId,
      action: 'order.create',
      entity: 'Order',
      entityId: order.id,
      description: 'User created order',
      metadata: { orderCode: order.code, grandTotal: preview.grandTotal },
    });

    return this.handlePaymentRedirect(order, preview, input);
  }

  public generateOrderCode() {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    return 'ORD-' + dateStr + '-' + randomStr;
  }

  public async handlePaymentRedirect(order: any, preview: any, input: any) {
    if (input.paymentMethod === PaymentMethod.PAYOS) {
      const numericOrderCode =
        Number(Date.now().toString().slice(-9)) +
        Math.floor(Math.random() * 1000);
      const webLearnerUrl = this.appConfig.identity.webLearnerUrl;
      const payOsItems = [
        ...preview.vodPackages.map((o: any) => ({
          name: o.title,
          quantity: 1,
          price: Number(o.discountPrice ?? o.price),
        })),
        ...preview.cohorts.map((o: any) => ({
          name: o.name,
          quantity: 1,
          price: Number(o.discountPrice ?? o.price),
        })),
        ...preview.subscriptionPlans.map((s: any) => ({
          name: s.name,
          quantity: 1,
          price: Number(s.price),
        })),
      ];

      const paymentLink = await this.payOS.createPaymentLink({
        orderCode: numericOrderCode,
        amount: preview.grandTotal,
        description: 'DH ' + order.code,
        cancelUrl: webLearnerUrl + '/payment/cancel?orderCode=' + order.code,
        returnUrl: webLearnerUrl + '/payment/success?orderCode=' + order.code,
        items: payOsItems,
      });

      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          metadata: {
            ...(order.metadata as any),
            paymentLinkId: paymentLink.paymentLinkId,
            numericOrderCode,
            checkoutUrl: paymentLink.checkoutUrl,
          } as any,
        },
      });

      return {
        orderId: order.id,
        orderCode: order.code,
        paymentUrl: paymentLink.checkoutUrl,
      };
    }

    if (input.paymentMethod === PaymentMethod.COIN) {
      return this.processCoinPayment(order.userId, order);
    }

    return {
      orderId: order.id,
      orderCode: order.code,
      message: 'Order created. Please proceed with manual payment.',
    };
  }

  private async processCoinPayment(userId: string, order: any) {
    const currentOrder = await this.prisma.order.findUnique({
      where: { id: order.id },
      select: { status: true },
    });
    if (currentOrder?.status === OrderStatus.PAID)
      return {
        orderId: order.id,
        orderCode: order.code,
        message: 'Đơn hàng đã được thanh toán từ trước',
        success: true,
      };

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, walletBalance: true },
    });

    if (!user) throw new NotFoundException('Người dùng không tồn tại');

    const total = Number(order.grandTotal);

    try {
      await this.prisma.$transaction(async (tx) => {
        // 1. Deduct balance safely (Atomic check)
        const updatedUser = await tx.user.updateMany({
          where: { id: userId, walletBalance: { gte: order.grandTotal } },
          data: {
            walletBalance: { decrement: order.grandTotal },
          },
        });

        if (updatedUser.count === 0) {
          throw new BadRequestException(
            'Số dư xu không đủ để thực hiện thanh toán này',
          );
        }

        // 2. Log Wallet Transaction
        await tx.walletTransaction.create({
          data: {
            userId,
            amount: order.grandTotal,
            type: 'PURCHASE',
            referenceId: order.id,
            description: `Thanh toán đơn hàng ${order.code} bằng Xu`,
          },
        });

        // 3. Mark Order as PAID
        await tx.order.update({
          where: { id: order.id },
          data: {
            status: OrderStatus.PAID,
            paidAt: new Date(),
          },
        });

        // 4. Record internal transaction record for bookkeeping
        await tx.transaction.create({
          data: {
            orderId: order.id,
            gateway: PaymentGateway.INTERNAL,
            amount: order.grandTotal,
            status: 'SUCCESS',
            transactionCode: order.code,
            responsePayload: { method: 'COIN' } as any,
          },
        });

        // 5. Fulfillment: ONLY AI Subscriptions (Courses are handled by OrderListener)
        const targetUserId = await this.resolveTargetUserId(
          order.userId,
          order.metadata,
        );
        for (const item of order.items) {
          if (item.subscriptionPlanId) {
            await this.fulfillAiSubscription(tx, targetUserId, item);
          }
        }
      });

      this.logger.log(`Order ${order.code} paid with coins successfully`);

      // Emit order.paid event for external fulfillment (e.g., Course Enrollments)
      this.natsClient.emit('order.paid', { orderId: order.id });

      return {
        orderId: order.id,
        orderCode: order.code,
        message: 'Thanh toán bằng xu thành công!',
        success: true,
      };
    } catch (err: any) {
      this.logger.error(
        `Coin payment failed for order ${order.code}: ${err.message}`,
      );
      throw new BadRequestException(`Thanh toán thất bại: ${err.message}`);
    }
  }
  async handlePaymentSuccess(
    orderCode: string,
    transactionId?: string,
    payload?: any,
  ) {
    if (payload) {
      if (!this.payOS.verifyPaymentWebhookData(payload))
        throw new BadRequestException('Invalid webhook signature');
      if (payload.success !== true && payload.code !== '00')
        throw new BadRequestException('Payment not successful');
    }

    if (transactionId) {
      const existingTransaction = await this.prisma.transaction.findFirst({
        where: {
          gateway: PaymentGateway.PAYOS,
          transactionCode: transactionId,
          status: 'SUCCESS',
        },
        select: { id: true },
      });
      if (existingTransaction) return { ok: true, idempotent: true };
    }

    let order = await this.prisma.order.findUnique({
      where: { code: orderCode },
      include: { items: true },
    });
    if (!order) {
      const numericCode = Number(orderCode);
      if (!isNaN(numericCode)) {
        order = await this.prisma.order.findFirst({
          where: {
            metadata: { path: ['numericOrderCode'], equals: numericCode },
          },
          include: { items: true },
        });
      }
      if (!order) throw new NotFoundException('Order not found');
    }

    return this.processPayment(order, transactionId, payload);
  }

  public async processPayment(
    order: any,
    transactionId?: string,
    payload?: any,
  ) {
    if (order.status === OrderStatus.PAID) return { ok: true };

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.PAID, paidAt: new Date() },
      });

      if (order.couponId)
        await this.couponService.recordUsage(
          tx,
          order.couponId,
          order.userId,
          order.id,
        );

      await tx.transaction.create({
        data: {
          orderId: order.id,
          gateway: PaymentGateway.PAYOS,
          transactionCode: transactionId,
          amount: order.grandTotal,
          status: 'SUCCESS',
          responsePayload: payload || {},
        },
      });

      const targetUserId = await this.resolveTargetUserId(
        order.userId,
        order.metadata,
      );
      for (const item of order.items) {
        if (item.subscriptionPlanId)
          await this.fulfillAiSubscription(tx, targetUserId, item);
      }
    });

    this.logger.log('Order fulfilled');
    this.natsClient.emit('order.paid', { orderId: order.id });

    try {
      this.natsClient.emit(
        { cmd: 'send_notification' },
        {
          recipientId: order.userId,
          type: 'system',
          payload: {
            title: 'Thanh toán thành công',
            body: 'Đơn hàng thành công.',
            metadata: { orderId: order.id, amount: order.grandTotal },
          },
        },
      );
    } catch (e: any) {
      this.logger.error(e.message);
    }

    return { ok: true };
  }

  public async fulfillAiSubscription(tx: any, targetUserId: string, item: any) {
    const now = new Date();

    // Find active subscription for stacking logic
    const activeSub = await tx.aiUserSubscription.findFirst({
      where: { userId: targetUserId, status: 'ACTIVE' },
      orderBy: { expiresAt: 'desc' },
    });

    let newExpiresAt = new Date();
    newExpiresAt.setMonth(newExpiresAt.getMonth() + 1);

    if (activeSub && activeSub.expiresAt > now) {
      // Stack from current expiresAt
      newExpiresAt = new Date(activeSub.expiresAt);
      newExpiresAt.setMonth(newExpiresAt.getMonth() + 1);
    }

    // Cancel old ones (or update them to EXTENDED/EXPIRED)
    await tx.aiUserSubscription.updateMany({
      where: { userId: targetUserId, status: 'ACTIVE' },
      data: { status: 'CANCELLED' },
    });

    // Create new one starting from the right point, or just creating a new one that captures the full period
    await tx.aiUserSubscription.create({
      data: {
        userId: targetUserId,
        planId: item.subscriptionPlanId,
        planCode: item.offeringSnapshot?.code || 'unknown',
        startedAt: now,
        expiresAt: newExpiresAt,
        status: 'ACTIVE',
      },
    });
  }

  public async resolveTargetUserId(
    buyerId: string,
    metadata: any,
  ): Promise<string> {
    const md = metadata ?? {};
    if (md.isGift && md.recipientEmail) {
      const recipientEmail = md.recipientEmail.toLowerCase();
      try {
        const response = await firstValueFrom<{ user: { id: string } }>(
          this.natsClient.send(
            { cmd: 'identity.users.findByEmail' },
            { email: recipientEmail },
          ),
        );
        if (response?.user?.id) return response.user.id;
        throw new BadRequestException(
          `Không tìm thấy người nhận với email ${recipientEmail}`,
        );
      } catch (err: any) {
        this.logger.error(`Failed to resolve gift recipient: ${err.message}`);
        throw new BadRequestException(
          err.message || 'Lỗi khi xác định người nhận quà',
        );
      }
    }
    return buyerId;
  }

  // --- Admin CRUD ---
  async admin_findAll(query: any) {
    const where: any = {};
    if (query.userId) where.userId = query.userId;
    if (query.status) where.status = query.status;

    const limit = Math.max(1, Number(query.limit || 20));
    const skip = query.page ? (Math.max(1, Number(query.page)) - 1) * limit : 0;

    const [total, items] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        include: {
          user: { select: { email: true, displayName: true } },
          items: {
            include: { vodPackage: true, cohort: true, subscriptionPlan: true },
          },
          transactions: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
    ]);
    return {
      data: items,
      total,
      limit,
      page: Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit),
    };
  }

  async admin_getStats(query: any) {
    const where: any = {};
    if (query.status) where.status = query.status;
    const [totalOrders, rev] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.aggregate({
        where: { ...where, status: OrderStatus.PAID },
        _sum: { grandTotal: true },
      }),
    ]);
    return { totalOrders, totalRevenue: Number(rev._sum.grandTotal || 0) };
  }

  async admin_findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, displayName: true } },
        items: {
          include: { vodPackage: true, cohort: true, subscriptionPlan: true },
        },
        transactions: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async admin_updateStatus(
    id: string,
    status: OrderStatus,
    requesterId = 'SYSTEM',
  ) {
    return this.prisma.order.update({ where: { id }, data: { status } });
  }

  async admin_getTransactions(orderId: string) {
    return this.prisma.transaction.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createDepositRequest(userId: string, targetAmount: number) {
    throw new BadRequestException('Not supported');
  }

  async processWalletPayment(userId: string, orderCode: string) {
    throw new BadRequestException('Not supported');
  }

  async getByCodeForUser(userId: string, code: string) {
    let order = await this.prisma.order.findFirst({
      where: { code, userId },
      include: {
        items: {
          include: { vodPackage: true, cohort: true, subscriptionPlan: true },
        },
        enrollments: { select: { liveClassId: true, vodPackageId: true } },
      },
    });
    if (!order) {
      const numericCode = Number(code);
      if (!isNaN(numericCode)) {
        order = await this.prisma.order.findFirst({
          where: {
            userId,
            metadata: { path: ['numericOrderCode'], equals: numericCode },
          } as any,
          include: {
            items: {
              include: {
                vodPackage: true,
                cohort: true,
                subscriptionPlan: true,
              },
            },
            enrollments: { select: { liveClassId: true, vodPackageId: true } },
          },
        });
      }
    }
    if (!order || order.userId !== userId)
      throw new NotFoundException('Order not found');

    const itemResults = order.items.map((item) => {
      const snapshot = (item.offeringSnapshot ?? {}) as {
        selectedClassId?: string;
        mode?: string;
      };
      const expectedClassIds =
        snapshot.mode === 'LIVE' && snapshot.selectedClassId
          ? [snapshot.selectedClassId]
          : [];
      const enrolledClassIds = order.enrollments
        .filter(
          (e) => e.liveClassId && expectedClassIds.includes(e.liveClassId),
        )
        .map((e) => e.liveClassId!);
      const missingClassIds = expectedClassIds.filter(
        (id) => !enrolledClassIds.includes(id),
      );
      const productName =
        item.vodPackage?.title ??
        item.cohort?.name ??
        item.subscriptionPlan?.name ??
        (snapshot as any).title ??
        '—';
      const productCode =
        item.vodPackage?.code ??
        item.cohort?.code ??
        item.subscriptionPlan?.code ??
        '—';
      const productId =
        item.vodPackageId ??
        item.cohortId ??
        item.subscriptionPlanId ??
        item.id;

      return {
        productId,
        productCode,
        productName,
        expectedClassIds,
        enrolledClassIds,
        missingClassIds,
      };
    });

    return {
      id: order.id,
      code: order.code,
      status: order.status,
      paidAt: order.paidAt,
      grandTotal: order.grandTotal,
      currency: order.currency,
      items: itemResults,
    };
  }

  async findAllForUser(userId: string, query: any) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: { vodPackage: true, cohort: true, subscriptionPlan: true },
        },
      },
    });
  }

  async admin_cancel(id: string, requesterId?: string) {
    return this.prisma.order.update({
      where: { id },
      data: { status: 'CANCELLED' as any },
    });
  }

  async findOneForUser(userId: string, id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
    if (!order || order.userId !== userId)
      throw new NotFoundException('Order not found');
    return order;
  }

  async repayOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: { vodPackage: true, cohort: true, subscriptionPlan: true },
        },
      },
    });

    if (!order || order.userId !== userId) {
      throw new NotFoundException('Không tìm thấy đơn hàng');
    }

    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException(
        'Đơn hàng không ở trạng thái chờ thanh toán',
      );
    }

    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    if (order.createdAt < fifteenMinutesAgo) {
      // Auto cancel if user tries to repay an old order
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
      });
      throw new BadRequestException('Đơn hàng đã quá hạn thanh toán (15 phút)');
    }

    // Re-construct preview data for handlePaymentRedirect
    const preview = {
      grandTotal: Number(order.grandTotal),
      vodPackages: order.items
        .filter((i) => i.vodPackage)
        .map((i) => i.vodPackage),
      cohorts: order.items.filter((i) => i.cohort).map((i) => i.cohort),
      subscriptionPlans: order.items
        .filter((i) => i.subscriptionPlan)
        .map((i) => i.subscriptionPlan),
    };

    const input = {
      paymentMethod: order.paymentMethod,
    };

    return this.handlePaymentRedirect(order, preview, input);
  }

  async handleOrderAutoCancellation() {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const ordersToCancel = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.PENDING,
        createdAt: {
          lt: fifteenMinutesAgo,
        },
      },
      select: { id: true, code: true },
    });

    if (ordersToCancel.length > 0) {
      this.logger.log(
        `Auto-cancelling ${ordersToCancel.length} expired orders`,
      );
      await this.prisma.order.updateMany({
        where: {
          id: { in: ordersToCancel.map((o) => o.id) },
        },
        data: {
          status: OrderStatus.CANCELLED,
        },
      });

      for (const order of ordersToCancel) {
        await this.audit.log({
          userId: 'SYSTEM',
          action: 'order.auto_cancel',
          entity: 'Order',
          entityId: order.id,
          description: `Hệ thống tự động hủy đơn hàng ${order.code} do quá hạn 15 phút`,
        });
      }
    }
    return ordersToCancel.length;
  }

  async admin_findOrdersByOffering(offeringId: string, query: any) {
    return { data: [], total: 0, limit: 10, page: 1, totalPages: 0 };
  }

  async admin_getStatsByOffering(offeringId: string) {
    return { totalOrders: 0, totalRevenue: 0 };
  }

  async admin_exportOrders(query: any) {
    const where: any = {};
    if (query.userId) where.userId = query.userId;
    if (query.status && query.status !== 'all') where.status = query.status;

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate)
        where.createdAt.gte = new Date(query.startDate + 'T00:00:00.000Z');
      if (query.endDate)
        where.createdAt.lte = new Date(query.endDate + 'T23:59:59.999Z');
    }

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { user: { email: { contains: query.search, mode: 'insensitive' } } },
        {
          user: { displayName: { contains: query.search, mode: 'insensitive' } },
        },
      ];
    }

    const items = await this.prisma.order.findMany({
      where,
      include: {
        user: { select: { email: true, displayName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orders');

    worksheet.columns = [
      { header: 'Mã đơn hàng', key: 'code', width: 25 },
      { header: 'Khách hàng', key: 'user', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Ngày tạo', key: 'createdAt', width: 20 },
      { header: 'Trạng thái', key: 'status', width: 15 },
      { header: 'Tổng tiền', key: 'grandTotal', width: 15 },
      { header: 'Phương thức', key: 'paymentMethod', width: 15 },
    ];

    items.forEach((order) => {
      worksheet.addRow({
        code: order.code,
        user: order.user?.displayName || 'N/A',
        email: order.user?.email || 'N/A',
        createdAt: order.createdAt.toLocaleString('vi-VN'),
        status: order.status,
        grandTotal: Number(order.grandTotal),
        paymentMethod: order.paymentMethod,
      });
    });

    const buffer = await workbook.csv.writeBuffer();
    return buffer;
  }
}

