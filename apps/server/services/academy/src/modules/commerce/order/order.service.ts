import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
  OrderStatus,
  PaymentMethod,
  PaymentGateway,
  OfferingStatus,
  ClassStatus,
  ClassMode,
} from '@prisma/generated';
import { CouponService } from '../coupon.service';
import { PayOSService } from '../payos.service';
import { EnrollmentService } from '../../classroom/enrollment/enrollment.service';
import { AuditLoggerService } from '../../audit-logger.service';
import { OrderCheckoutDto, OrderPreviewDto } from './dto/order.dto';
import { Prisma } from '@prisma/generated';
import { AppConfigService } from '@server/shared';
import { ClientProxy } from '@nestjs/microservices';
import { AiSubscriptionService } from '../quota/ai-subscription.service';

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
    const offeringIds = Array.from(new Set(input.offeringIds ?? []));
    const subscriptionPlanIds = Array.from(
      new Set(input.subscriptionPlanIds ?? []),
    );
    const now = new Date();

    if (!offeringIds.length && !subscriptionPlanIds.length) {
      throw new BadRequestException(
        'At least one offering or subscription plan must be provided',
      );
    }

    const offerings = offeringIds.length
      ? await this.prisma.courseOffering.findMany({
          where: {
            id: { in: offeringIds },
            status: { in: [OfferingStatus.PUBLISHED, OfferingStatus.OPENING] },
          },
          include: {
            term: {
              select: {
                enrollmentOpenAt: true,
                enrollmentCloseAt: true,
              },
            },
          },
        })
      : [];

    if (offerings.length !== offeringIds.length) {
      throw new BadRequestException('Some offerings are not available');
    }

    for (const offering of offerings) {
      const selectedClassId = input.classIdByOffering?.[offering.id];
      let klass: any;

      if (offering.mode === ClassMode.LIVE) {
        if (!selectedClassId) {
          throw new BadRequestException(
            `Vui lòng chọn lớp học cụ thể cho gói ${offering.code}`,
          );
        }
        klass = await this.prisma.class.findUnique({
          where: { id: selectedClassId },
          include: {
            term: {
              select: {
                enrollmentOpenAt: true,
                enrollmentCloseAt: true,
              },
            },
          },
        });

        if (
          !klass ||
          klass.courseProfileId !== offering.courseProfileId ||
          klass.termId !== offering.termId
        ) {
          throw new BadRequestException(
            `Lớp học đã chọn không hợp lệ cho gói bán ${offering.code}`,
          );
        }
      } else {
        // VOD
        if (!offering.classId) {
          throw new BadRequestException(
            `Gói bán VOD ${offering.code} chưa được cấu hình lớp học.`,
          );
        }
        klass = await this.prisma.class.findUnique({
          where: { id: offering.classId },
          include: {
            term: {
              select: {
                enrollmentOpenAt: true,
                enrollmentCloseAt: true,
              },
            },
          },
        });
      }

      if (!klass) {
        throw new BadRequestException(
          `Offering ${offering.code} has no class mapped for enrollment`,
        );
      }

      // LIVE: class must be OPENING and within enrollment window
      if (offering.mode === ClassMode.LIVE) {
        if (klass.status !== ClassStatus.OPENING) {
          throw new BadRequestException(
            `Class ${klass.code} is not open for enrollment (status: ${klass.status})`,
          );
        }

        const term = klass.term;
        if (
          !term?.enrollmentOpenAt ||
          !term?.enrollmentCloseAt ||
          new Date(term.enrollmentOpenAt) > now ||
          new Date(term.enrollmentCloseAt) < now
        ) {
          throw new BadRequestException(
            `Class ${klass.code} is outside enrollment window or has no term defined`,
          );
        }
      } else {
        // VOD or other: class must be PUBLISHED/OPENING/ONGOING
        if (
          klass.status !== ClassStatus.OPENING &&
          klass.status !== ClassStatus.ONGOING &&
          klass.status !== ClassStatus.PUBLISHED
        ) {
          throw new BadRequestException(
            `Class ${klass.code} is in status ${klass.status}, not sellable`,
          );
        }
      }
    }

    const subscriptionPlans = subscriptionPlanIds.length
      ? await this.prisma.aiSubscriptionPlan.findMany({
          where: {
            id: { in: subscriptionPlanIds },
            isActive: true,
          },
        })
      : [];

    if (subscriptionPlans.length !== subscriptionPlanIds.length) {
      throw new BadRequestException(
        'Some subscription plans are not available',
      );
    }

    const subTotal =
      offerings.reduce((sum, o) => sum + Number(o.salePrice ?? o.price), 0) +
      subscriptionPlans.reduce((sum, s) => sum + Number(s.price), 0);

    let discountTotal = 0;
    let couponId: string | undefined;

    if (input.couponCode) {
      const coupon = await this.couponService.validateCoupon(
        input.couponCode,
        userId,
        subTotal,
        offeringIds,
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
      offerings,
      subscriptionPlans,
      couponId,
    };
  }

  async checkout(userId: string, input: OrderCheckoutDto) {
    if (input.subscriptionPlanIds?.length && !input.offeringIds?.length) {
      return this.checkoutSubscription(userId, input);
    }
    return this.checkoutCourse(userId, input);
  }

  async checkoutCourse(userId: string, input: OrderCheckoutDto) {
    this.logger.log(`[Academy] Course checkout: ${userId}`);
    const preview = await this.preview(userId, {
      ...input,
      subscriptionPlanIds: [], // Force only courses
    });

    const orderCode = this.generateOrderCode();
    const orderItemsData = preview.offerings.map((o) => {
      // Use selected classId if provided for this offering
      const selectedClassId = input.classIdByOffering?.[o.id];
      const classIdToEnroll = selectedClassId ?? o.classId;

      return {
        offeringId: o.id,
        price: o.salePrice ?? o.price,
        offeringSnapshot: {
          title: o.title,
          code: o.code,
          mode: o.mode,
          selectedClassId: classIdToEnroll,
        } as any,
      };
    });

    const order = await this.createOrderRecord(
      userId,
      orderCode,
      preview,
      input,
      orderItemsData,
    );
    return this.handlePaymentRedirect(order, preview, input);
  }

  async checkoutSubscription(userId: string, input: OrderCheckoutDto) {
    this.logger.log(`[Academy] Subscription checkout: ${userId}`);
    const preview = await this.preview(userId, {
      ...input,
      offeringIds: [], // Force only subscriptions
    });

    const orderCode = this.generateOrderCode();
    const orderItemsData = (preview.subscriptionPlans ?? []).map((s) => ({
      subscriptionPlanId: s.id,
      price: s.price,
      offeringSnapshot: {
        title: s.name,
        code: s.code,
        isSubscription: true,
      } as any,
    }));

    const order = await this.createOrderRecord(
      userId,
      orderCode,
      preview,
      input,
      orderItemsData,
    );
    return this.handlePaymentRedirect(order, preview, input);
  }

  private generateOrderCode() {
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${dateStr}-${randomStr}`;
  }

  private async createOrderRecord(
    userId: string,
    orderCode: string,
    preview: any,
    input: any,
    items: any[],
  ) {
    const order = await this.prisma.order.create({
      data: {
        code: orderCode,
        userId,
        status: OrderStatus.PENDING,
        subTotal: new Prisma.Decimal(preview.subTotal),
        discountTotal: new Prisma.Decimal(preview.discountTotal),
        grandTotal: new Prisma.Decimal(preview.grandTotal),
        currency: preview.offerings[0]?.currency || 'VND',
        couponCode: input.couponCode,
        couponId: preview.couponId,
        paymentMethod: input.paymentMethod,
        items: { create: items },
      },
      include: { items: true },
    });

    await this.audit.log({
      userId,
      action: 'order.create',
      entity: 'Order',
      entityId: order.id,
      description: `User created order ${order.code} for ${preview.grandTotal} ${order.currency}`,
      metadata: { orderCode: order.code, grandTotal: preview.grandTotal },
    });

    return order;
  }

  private async handlePaymentRedirect(order: any, preview: any, input: any) {
    if (input.paymentMethod === PaymentMethod.PAYOS) {
      const numericOrderCode =
        Number(Date.now().toString().slice(-9)) +
        Math.floor(Math.random() * 1000);
      const webLearnerUrl = this.appConfig.identity.webLearnerUrl;
      const payOsDescription = `DH ${order.code}`.slice(0, 25);

      const payOsItems = [
        ...preview.offerings.map((o) => ({
          name: o.title,
          quantity: 1,
          price: Number(o.salePrice ?? o.price),
        })),
        ...(preview.subscriptionPlans ?? []).map((s) => ({
          name: s.name,
          quantity: 1,
          price: Number(s.price),
        })),
      ];

      const paymentLink = await this.payOS.createPaymentLink({
        orderCode: numericOrderCode,
        amount: preview.grandTotal,
        description: payOsDescription,
        cancelUrl: `${webLearnerUrl}/payment/cancel?orderCode=${order.code}`,
        returnUrl: `${webLearnerUrl}/payment/success?orderCode=${order.code}`,
        items: payOsItems,
      });

      await this.prisma.order.update({
        where: { id: order.id },
        data: {
          metadata: {
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

    return {
      orderId: order.id,
      orderCode: order.code,
      message: 'Order created. Please proceed with manual payment.',
    };
  }

  async handlePaymentSuccess(
    orderCode: string,
    transactionId?: string,
    payload?: any,
  ) {
    if (payload) {
      const isValid = this.payOS.verifyPaymentWebhookData(payload);
      if (!isValid) {
        throw new BadRequestException('Invalid PayOS webhook signature');
      }
      const isSuccess = payload?.success === true || payload?.code === '00';
      if (!isSuccess) {
        throw new BadRequestException('PayOS payment is not successful');
      }
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
      if (existingTransaction) {
        return { ok: true, idempotent: true };
      }
    }

    const order = await this.prisma.order.findUnique({
      where: { code: orderCode },
      include: { items: true },
    });

    if (!order) {
      const numericCode = Number(orderCode);
      if (!isNaN(numericCode)) {
        const orderWithMetadata = await this.prisma.order.findFirst({
          where: {
            metadata: {
              path: ['numericOrderCode'],
              equals: numericCode,
            },
          },
          include: { items: true },
        });
        if (orderWithMetadata)
          return this.processPayment(orderWithMetadata, transactionId, payload);
      }
      throw new NotFoundException('Order not found');
    }

    return this.processPayment(order, transactionId, payload);
  }

  private async processPayment(
    order: any,
    transactionId?: string,
    payload?: any,
    requesterId = 'SYSTEM',
  ) {
    if (order.status === OrderStatus.PAID) return { ok: true };

    await this.prisma.$transaction(async (tx) => {
      // Update Order
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.PAID,
          paidAt: new Date(),
        },
      });

      // NOTE: Systemic audit logs are disabled here to avoid UUID foreign key issues with 'SYSTEM' ID
      // and because fulfillment events provide sufficient traceability.

      // Update Coupon Usage
      if (order.couponId) {
        await this.couponService.recordUsage(
          tx,
          order.couponId,
          order.userId,
          order.id,
        );
      }

      // Record Transaction
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

      // Fulfillment: ONLY AI Subscriptions (Courses are handled by OrderListener)
      for (const item of order.items) {
        if (item.subscriptionPlanId) {
          await this.fulfillAiSubscription(tx, order, item);
        }
      }
    });

    this.logger.log(`Order ${order.code} fulfilled successfully`);

    // Emit order.paid event for external fulfillment (e.g., Course Enrollments)
    this.natsClient.emit('order.paid', { orderId: order.id });

    // Emit notification via NATS
    try {
      const firstItem = order.items[0];
      const snapshot = (firstItem?.offeringSnapshot ?? {}) as {
        title?: string;
      };
      const itemName = snapshot.title || 'mục đã mua';

      this.natsClient.emit(
        { cmd: 'send_notification' },
        {
          recipientId: order.userId,
          type: 'system',
          payload: {
            title: 'Thanh toán thành công 🎉',
            body: `Bạn đã thanh toán thành công cho "${itemName}".`,
            metadata: {
              orderId: order.id,
              orderCode: order.code,
              amount: order.grandTotal,
            },
          },
        },
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to emit notification for order ${order.code}: ${error.message}`,
      );
    }

    return { ok: true };
  }

  private async fulfillAiSubscription(tx: any, order: any, item: any) {
    try {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      // Deactivate existing
      await tx.aiUserSubscription.updateMany({
        where: { userId: order.userId, status: 'ACTIVE' },
        data: { status: 'CANCELLED' },
      });

      await tx.aiUserSubscription.create({
        data: {
          userId: order.userId,
          planId: item.subscriptionPlanId,
          planCode: item.offeringSnapshot?.code || 'unknown',
          startedAt: new Date(),
          expiresAt,
          status: 'ACTIVE',
        },
      });

      this.logger.log(`Subscription activated for user ${order.userId}`);
    } catch (err: any) {
      this.logger.error(
        `Subscription fulfillment failed for order ${order.code}: ${err.message}`,
      );
      throw new BadRequestException(
        `Subscription fulfillment failed: ${err.message}`,
      );
    }
  }

  // --- Admin CRUD ---

  async admin_findAll(query: {
    userId?: string;
    status?: OrderStatus;
    search?: string;
    limit?: any;
    offset?: any;
    page?: any;
  }) {
    const where: any = {};
    if (query.userId) where.userId = query.userId;
    if (query.status) where.status = query.status;

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { user: { email: { contains: query.search, mode: 'insensitive' } } },
        {
          user: {
            displayName: { contains: query.search, mode: 'insensitive' },
          },
        },
      ];
    }

    const limit = Math.max(1, Number(query.limit || 20));
    let skip = 0;

    if (query.offset !== undefined) {
      skip = Math.max(0, Number(query.offset));
    } else if (query.page !== undefined) {
      const page = Math.max(1, Number(query.page));
      skip = (page - 1) * limit;
    }

    const [total, items] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        include: {
          user: { select: { email: true, displayName: true } },
          items: { include: { offering: true, subscriptionPlan: true } },
          transactions: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: skip,
      }),
    ]);

    return {
      data: items,
      total,
      limit,
      skip,
      page: query.page ? Number(query.page) : Math.floor(skip / limit) + 1,
      totalPages: Math.ceil(total / limit),
    };
  }

  async admin_getStats(query: {
    startDate?: string;
    endDate?: string;
    status?: OrderStatus;
  }) {
    const where: any = {};
    if (query.status) {
      where.status = query.status;
    }

    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        const end = new Date(query.endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const [totalOrders, revenueResult] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.aggregate({
        where: {
          ...where,
          status: OrderStatus.PAID,
        },
        _sum: {
          grandTotal: true,
        },
      }),
    ]);

    return {
      totalOrders,
      totalRevenue: Number(revenueResult._sum.grandTotal || 0),
    };
  }

  async admin_findOrdersByOffering(
    offeringId: string,
    query: { page?: number; limit?: number; search?: string },
  ) {
    const where: any = {
      items: {
        some: {
          offeringId: offeringId,
        },
      },
    };

    if (query.search) {
      where.OR = [
        { code: { contains: query.search, mode: 'insensitive' } },
        { user: { email: { contains: query.search, mode: 'insensitive' } } },
        {
          user: {
            displayName: { contains: query.search, mode: 'insensitive' },
          },
        },
      ];
    }

    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Number(query.limit || 20));
    const skip = (page - 1) * limit;

    const [total, items] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        include: {
          user: { select: { email: true, displayName: true } },
          items: {
            where: { offeringId },
            include: { offering: true },
          },
          transactions: true,
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: skip,
      }),
    ]);

    return {
      data: items,
      total,
      limit,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async admin_getStatsByOffering(offeringId: string) {
    const where = {
      items: {
        some: {
          offeringId: offeringId,
        },
      },
    };

    const [totalOrders, revenueResult] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.aggregate({
        where: {
          ...where,
          status: OrderStatus.PAID,
        },
        _sum: {
          grandTotal: true,
        },
      }),
    ]);

    // Note: totalRevenue here is actually the sum of grandTotal of orders containing this item.
    // In a multi-item order, this might be slightly inaccurate if we want "revenue from this item only",
    // but usually in this system, orders are 1:1 with offerings for courses.
    return {
      totalOrders,
      totalRevenue: Number(revenueResult._sum.grandTotal || 0),
    };
  }

  async admin_findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, displayName: true } },
        items: { include: { offering: true, subscriptionPlan: true } },
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
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) throw new NotFoundException('Order not found');

    if (status === OrderStatus.PAID && order.status !== OrderStatus.PAID) {
      return this.processPayment(order, 'MANUAL', null, requesterId);
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'order.update_status',
      entity: 'Order',
      entityId: id,
      description: `Admin updated order ${order.code} status from ${order.status} to ${status}`,
      oldValues: { status: order.status },
      newValues: { status },
    });

    return updated;
  }

  async admin_cancel(id: string, requesterId = 'SYSTEM') {
    const order = await this.prisma.order.findUnique({
      where: { id },
    });

    if (!order) throw new NotFoundException('Order not found');

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: OrderStatus.CANCELLED },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'order.cancel',
      entity: 'Order',
      entityId: id,
      description: `Admin cancelled order ${order.code} (previous status: ${order.status})`,
      metadata: { oldStatus: order.status },
    });

    return updated;
  }

  async getByCodeForUser(userId: string, orderCode: string) {
    const order = await this.prisma.order.findFirst({
      where: { code: orderCode, userId },
      include: {
        items: {
          include: {
            offering: { select: { id: true, title: true, code: true } },
            subscriptionPlan: true,
          },
        },
        enrollments: {
          select: {
            classId: true,
            status: true,
            offeringId: true,
          },
        },
      },
    });

    if (!order) throw new NotFoundException('Order not found');

    const courseItems = order.items.filter(
      (item) => !!item.offeringId && !!item.offering,
    );

    const itemResults = courseItems.map((item) => {
      const snapshot = (item.offeringSnapshot ?? {}) as { classIds?: string[] };
      const expectedClassIds = Array.isArray(snapshot.classIds)
        ? snapshot.classIds
        : [];
      const enrolledClassIds = order.enrollments
        .filter((enrollment) => enrollment.offeringId === item.offeringId)
        .map((enrollment) => enrollment.classId);
      const missingClassIds = expectedClassIds.filter(
        (classId) => !enrolledClassIds.includes(classId),
      );

      return {
        offeringId: item.offeringId,
        offeringCode: item.offering!.code,
        offeringTitle: item.offering!.title,
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

  async findAllForUser(
    userId: string,
    query: { page?: number; limit?: number; status?: string; search?: string },
  ) {
    const page = Math.max(1, Number(query.page || 1));
    const limit = Math.max(1, Math.min(100, Number(query.limit || 10)));
    const where: Prisma.OrderWhereInput = {
      userId,
      status: query.status ? (query.status as OrderStatus) : undefined,
      ...(query.search
        ? {
            OR: [
              { code: { contains: query.search, mode: 'insensitive' } },
              {
                items: {
                  some: {
                    offering: {
                      title: { contains: query.search, mode: 'insensitive' },
                    },
                  },
                },
              },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              offering: {
                select: { id: true, title: true, code: true },
              },
              subscriptionPlan: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOneForUser(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: {
          include: {
            offering: {
              select: { id: true, title: true, code: true },
            },
            subscriptionPlan: true,
          },
        },
        transactions: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
