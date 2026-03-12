import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
  OrderStatus,
  PaymentMethod,
  PaymentGateway,
  OfferingStatus,
  ClassStatus,
} from '@prisma/generated';
import { CouponService } from '../coupon.service';
import { PayOSService } from '../payos.service';
import { EnrollmentService } from '../../classroom/enrollment/enrollment.service';
import { AuditLoggerService } from '../../audit-logger.service';
import { AiSubscriptionService } from '../quota/ai-subscription.service';
import { OrderCheckoutDto, OrderPreviewDto } from './dto/order.dto';
import { Prisma } from '@prisma/generated';
import { AppConfigService } from '@server/shared';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly couponService: CouponService,
    private readonly payOS: PayOSService,
    private readonly enrollmentService: EnrollmentService,
    private readonly aiSubscriptionService: AiSubscriptionService,
    private readonly appConfig: AppConfigService,
    private readonly audit: AuditLoggerService,
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) { }

  async preview(userId: string, input: OrderPreviewDto) {
    let offeringIds = Array.from(new Set(input.offeringIds ?? []));
    if (!offeringIds.length) {
      throw new BadRequestException('offeringIds must not be empty');
    }

    // 1. Fetch CourseOfferings (Strictly by ID as before)
    const courseOfferings = await this.prisma.courseOffering.findMany({
      where: {
        id: { in: offeringIds },
        status: { in: [OfferingStatus.PUBLISHED, OfferingStatus.OPENING] },
      },
      include: {
        classes: {
          include: {
            class: {
              select: {
                id: true,
                code: true,
                status: true,
                mode: true,
              },
            },
          },
        },
      },
    });

    // 2. Fetch AiSubscriptionPlans
    const subscriptionPlans = await this.prisma.aiSubscriptionPlan.findMany({
      where: {
        OR: [
          { id: { in: offeringIds } },
          { code: { in: offeringIds } }
        ],
        isActive: true,
      }
    });

    // 3. Combine and validate
    // Normalize subscription plans to match CourseOffering-like structure for the preview
    const normalizedSubs = subscriptionPlans.map(p => ({
      ...p,
      type: 'SUBSCRIPTION', // Marker for frontend and downstream logic
      classes: [], // Subscriptions don't have classes
    }));

    const allItems = [
      ...courseOfferings.map(o => ({ ...o, type: 'COURSE' })),
      ...normalizedSubs
    ] as any[];

    if (allItems.length !== offeringIds.length) {
      // Some IDs match neither or are duplicates? 
      // Actually, if a code was passed, subscriptionPlans will catch it. 
      // If a UUID was passed, either courseOfferings or subscriptionPlans will catch it.
      // We check if we found as many items as requested (unique IDs).
      const foundCount = allItems.length;
      if (foundCount < offeringIds.length) {
        throw new BadRequestException('Some offerings or plans are not available');
      }
    }

    // 4. Validate classes for COURSE items only
    for (const item of allItems) {
      if (item.type === 'COURSE') {
        if (!item.classes?.length) {
          throw new BadRequestException(
            `Offering ${item.code} has no class mapped for enrollment`,
          );
        }
        for (const offeringClass of item.classes) {
          const klass = offeringClass.class;
          if (
            klass.status !== ClassStatus.OPENING &&
            klass.status !== ClassStatus.ONGOING
          ) {
            throw new BadRequestException(
              `Class ${klass.code} is in status ${klass.status}, not sellable`,
            );
          }
        }
      }
    }

    const subTotal = allItems.reduce((sum, o) => {
      const unitPrice = o.salePrice ?? o.price;
      return sum + Number(unitPrice);
    }, 0);
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
      offerings: allItems,
      couponId,
    };
  }

  async checkout(userId: string, input: OrderCheckoutDto) {
    this.logger.log(`[DEBUG] Checkout starting for user ${userId}, offerings: ${JSON.stringify(input.offeringIds)}`);
    const preview = await this.preview(userId, input);
    const resolvedOfferingIds = preview.offerings.map(o => o.id);
    const offeringClassMap = await this.getOfferingClassMap(resolvedOfferingIds);

    // Generate readable code: ORD-YYYYMMDD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const orderCode = `ORD-${dateStr}-${randomStr}`;

    const order = await this.prisma.order.create({
      data: {
        code: orderCode,
        userId,
        status: OrderStatus.PENDING,
        type: preview.offerings.some(o => o.type === 'SUBSCRIPTION') ? OrderType.SUBSCRIPTION : OrderType.COURSE,
        subTotal: new Prisma.Decimal(preview.subTotal),
        discountTotal: new Prisma.Decimal(preview.discountTotal),
        grandTotal: new Prisma.Decimal(preview.grandTotal),
        currency: preview.offerings[0]?.currency || 'VND',
        couponCode: input.couponCode,
        couponId: preview.couponId,
        paymentMethod: input.paymentMethod,
        items: {
          create: preview.offerings.map((o) => ({
            offeringId: o.id,
            price: o.salePrice ?? o.price,
            offeringSnapshot: {
              title: o.title,
              code: o.code,
              type: o.type, // CRITICAL: Identify item type for fulfillment
              classIds: offeringClassMap.get(o.id) ?? [],
            } as any,
          })),
        },
      },
    });

    if (preview.grandTotal === 0) {
      this.logger.log(`Order ${order.code} is FREE (grandTotal=0). Activating immediately.`);
      await this.processPayment(order, 'INTERNAL_FREE', null, userId);
      return {
        orderCode: order.code,
        id: order.id,
        message: 'Order activated successfully.',
        status: OrderStatus.PAID,
      };
    }

    if (input.paymentMethod === PaymentMethod.PAYOS) {
      const numericOrderCode =
        Number(Date.now().toString().slice(-9)) +
        Math.floor(Math.random() * 1000);

      const webLearnerUrl = this.appConfig.identity.webLearnerUrl;
      // PayOS description has a strict max length (25 chars).
      const payOsDescription = `DH ${order.code}`.slice(0, 25);

      const paymentLink = await this.payOS.createPaymentLink({
        orderCode: numericOrderCode,
        amount: preview.grandTotal,
        description: payOsDescription,
        cancelUrl: `${webLearnerUrl}/payment/cancel?orderCode=${order.code}`,
        returnUrl: `${webLearnerUrl}/payment/success?orderCode=${order.code}`,
        items: preview.offerings.map((o) => {
          const unitPrice = o.salePrice ?? o.price;
          return {
            name: o.title,
            quantity: 1,
            price: Number(unitPrice),
          };
        }),
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
        orderCode: order.code,
        paymentUrl: paymentLink.checkoutUrl,
      };
    }

    return {
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

      await this.audit.log({
        userId: requesterId,
        action: 'order.payment_success',
        entity: 'Order',
        entityId: order.id,
        description: `Order ${order.code} marked as PAID. Transaction ID: ${transactionId}`,
        metadata: { orderCode: order.code, transactionId },
      });

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

      // Fulfillment: Enrollments
      for (const item of order.items) {
        const snapshot = (item.offeringSnapshot ?? {}) as {
          classIds?: string[];
        };
        const snapshotClassIds = Array.isArray(snapshot.classIds)
          ? snapshot.classIds
          : [];
        let classIdsToEnroll = [...snapshotClassIds];

        if (!classIdsToEnroll.length) {
          // Backward compatibility for legacy orders without snapshot classIds.
          const offeringClasses = await tx.courseOfferingClass.findMany({
            where: { offeringId: item.offeringId },
            select: { classId: true },
          });
          classIdsToEnroll = offeringClasses.map((oc) => oc.classId);
        }

        for (const classId of classIdsToEnroll) {
          try {
            await this.enrollmentService.create(
              {
                userId: order.userId,
                offeringId: item.offeringId,
                classId,
                status: 'ACTIVE',
                sourceOrderId: order.id,
              },
              requesterId,
              tx,
            );
          } catch (err) {
            this.logger.error(
              `Fulfillment failed for order ${order.code}, class ${classId}: ${err.message}`,
            );
            // Depending on policy, we might want to throw to rollback, or just log and continue.
            // User prompt says: "Nếu line-item không pass, xử lý theo policy: fail mềm có log/audit + trả trạng thái phù hợp, hoặc fail transaction có thông báo rõ."
            // I'll throw to ROLLBACK for now to ensure data integrity (no partial fulfillment).
            throw new BadRequestException(`Fulfillment failed: ${err.message}`);
          }
        }
      }

      // Fulfillment: AI Subscription (for SUBSCRIPTION order type)
      const subscriptionItems = order.items?.filter((item: any) => {
        const snapshot = (item.offeringSnapshot ?? {}) as any;
        return snapshot?.type === 'SUBSCRIPTION' || item.offering?.type === 'SUBSCRIPTION';
      }) ?? [];

      for (const item of subscriptionItems) {
        // Find AiSubscriptionPlan by code
        const snapshot = (item.offeringSnapshot ?? {}) as any;
        const planCode = snapshot?.code;
        if (planCode) {
          const plan = await tx.aiSubscriptionPlan.findUnique({ where: { code: planCode } });
          if (plan) {
            // Use specialized service for activation (handles planCode and expiry)
            await this.aiSubscriptionService.activateSubscription(order.userId, plan.id, order.id);
          }
        }
      }
    });

    this.logger.log(`Order ${order.code} fulfilled successfully`);

    // Emit notification via NATS (identity service will create in-app notification)
    try {
      const firstItem = order.items[0];
      const snapshot = (firstItem?.offeringSnapshot ?? {}) as {
        title?: string;
      };
      const courseTitle = snapshot.title || 'khóa học';
      const itemCount = order.items.length;

      const title = 'Thanh toán & ghi danh thành công 🎉';
      const message =
        itemCount === 1
          ? `Bạn đã thanh toán và ghi danh thành công vào "${courseTitle}". Bắt đầu học ngay nhé!`
          : `Bạn đã thanh toán và ghi danh thành công vào ${itemCount} khóa học. Bắt đầu học ngay nhé!`;

      this.natsClient.emit(
        { cmd: 'send_notification' },
        {
          recipientId: order.userId,
          type: 'system',
          payload: {
            title,
            body: message,
            metadata: {
              orderId: order.id,
              orderCode: order.code,
              itemCount,
              currency: order.currency,
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

  // --- Admin CRUD ---

  async admin_findAll(query: {
    userId?: string;
    status?: OrderStatus;
    limit?: any;
    offset?: any;
    page?: any;
  }) {
    const where: any = {};
    if (query.userId) where.userId = query.userId;
    if (query.status) where.status = query.status;

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
          items: { include: { offering: true } },
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

  async admin_findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, displayName: true } },
        items: { include: { offering: true } },
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

  async getByCodeForUser(userId: string, orderCode: string) {
    const order = await this.prisma.order.findFirst({
      where: { code: orderCode, userId },
      include: {
        items: {
          include: {
            offering: {
              select: { id: true, title: true, code: true },
            },
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

    const fallbackOfferingIds = order.items
      .filter((item) => {
        const snapshot = (item.offeringSnapshot ?? {}) as { classIds?: string[] };
        return !Array.isArray(snapshot.classIds);
      })
      .map((item) => item.offeringId);

    const fallbackClassMap = fallbackOfferingIds.length
      ? await this.getOfferingClassMap(fallbackOfferingIds)
      : new Map<string, string[]>();

    const itemResults = order.items.map((item) => {
      const snapshot = (item.offeringSnapshot ?? {}) as { classIds?: string[] };
      const expectedClassIds = Array.isArray(snapshot.classIds)
        ? snapshot.classIds
        : fallbackClassMap.get(item.offeringId) ?? [];
      const enrolledClassIds = order.enrollments
        .filter((enrollment) => enrollment.offeringId === item.offeringId)
        .map((enrollment) => enrollment.classId);
      const missingClassIds = expectedClassIds.filter(
        (classId) => !enrolledClassIds.includes(classId),
      );

      return {
        offeringId: item.offeringId,
        offeringCode: item.offering.code,
        offeringTitle: item.offering.title,
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
          },
        },
        transactions: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  private async getOfferingClassMap(offeringIds: string[]) {
    if (!offeringIds.length) {
      return new Map<string, string[]>();
    }

    const links = await this.prisma.courseOfferingClass.findMany({
      where: { offeringId: { in: offeringIds } },
      select: { offeringId: true, classId: true },
    });

    const map = new Map<string, string[]>();
    for (const offeringId of offeringIds) {
      map.set(offeringId, []);
    }
    for (const link of links) {
      const current = map.get(link.offeringId) ?? [];
      current.push(link.classId);
      map.set(link.offeringId, current);
    }
    return map;
  }
}
