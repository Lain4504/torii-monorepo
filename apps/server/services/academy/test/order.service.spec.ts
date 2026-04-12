import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrderService } from '../src/modules/commerce/order/order.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { CouponService } from '../src/modules/commerce/coupon.service';
import { PayOSService } from '../src/modules/commerce/payos.service';
import { EnrollmentService } from '../src/modules/classroom/enrollment/enrollment.service';
import { AuditLoggerService } from '../src/modules/audit-logger.service';
import { AppConfigService } from '@server/shared';
import { AiSubscriptionService } from '../src/modules/commerce/quota/ai-subscription.service';
import { of } from 'rxjs';
import { OrderStatus, PaymentMethod } from '@prisma/generated';

// Mock Prisma Decimal
jest.mock('@prisma/generated', () => {
  const original = jest.requireActual('@prisma/generated');
  return {
    ...original,
    Prisma: {
      ...original.Prisma,
      Decimal: jest.fn().mockImplementation((val) => ({
        toString: () => val.toString(),
        toNumber: () => Number(val),
      })),
    },
  };
});

describe('OrderService', () => {
  let service: OrderService;
  let mockPrisma: any;
  let mockCoupon: any;
  let mockPayOS: any;
  let mockEnrollment: any;
  let mockNats: any;

  beforeEach(async () => {
    mockPrisma = {
      vodPackage: { findMany: jest.fn() },
      cohort: { findMany: jest.fn() },
      liveClass: { findUnique: jest.fn(), findMany: jest.fn() },
      enrollment: { findFirst: jest.fn(), count: jest.fn() },
      aiSubscriptionPlan: { findMany: jest.fn() },
      order: { create: jest.fn(), update: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn() },
      user: { findUnique: jest.fn(), updateMany: jest.fn() },
      walletTransaction: { create: jest.fn() },
      transaction: { create: jest.fn(), findFirst: jest.fn() },
      aiUserSubscription: { findFirst: jest.fn(), updateMany: jest.fn(), create: jest.fn() },
      $transaction: jest.fn().mockImplementation((cb) => cb(mockPrisma)),
    };

    mockCoupon = {
      validateCoupon: jest.fn(),
      calculateDiscount: jest.fn(),
      recordUsage: jest.fn(),
    };

    mockPayOS = {
      createPaymentLink: jest.fn(),
      verifyPaymentWebhookData: jest.fn(),
    };

    mockEnrollment = {
      checkGiftRecipient: jest.fn(),
    };

    mockNats = {
      send: jest.fn().mockReturnValue(of({ user: { id: 'recipient-1' } })),
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CouponService, useValue: mockCoupon },
        { provide: PayOSService, useValue: mockPayOS },
        { provide: EnrollmentService, useValue: mockEnrollment },
        { provide: AppConfigService, useValue: { identity: { webLearnerUrl: 'http://test' } } },
        { provide: AuditLoggerService, useValue: { log: jest.fn() } },
        { provide: AiSubscriptionService, useValue: {} },
        { provide: 'NATS_SERVICE', useValue: mockNats },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('preview', () => {
    const userId = 'user-1';

    it('should throw if gift recipient not registered', async () => {
      mockNats.send.mockReturnValue(of({ user: null }));
      await expect(
        service.preview(userId, { isGift: true, recipientEmail: 'new@test.com', vodPackageIds: ['v1'] }),
      ).rejects.toThrow('Email người nhận chưa đăng ký');
    });

    it('should throw if product is already owned by user', async () => {
      mockPrisma.vodPackage.findMany.mockResolvedValue([{ id: 'v1', price: 100, title: 'VOD 1' }]);
      mockPrisma.enrollment.findFirst.mockResolvedValue({ id: 'e1' }); // Already owns

      await expect(
        service.preview(userId, { vodPackageIds: ['v1'] }),
      ).rejects.toThrow('Bạn đã sở hữu gói VOD này');
    });

    it('should calculate subtotal and discount correctly', async () => {
      mockPrisma.vodPackage.findMany.mockResolvedValue([{ id: 'v1', price: 100000, discountPrice: 80000 }]);
      mockPrisma.enrollment.findFirst.mockResolvedValue(null);
      mockCoupon.validateCoupon.mockResolvedValue({ id: 'c1' });
      mockCoupon.calculateDiscount.mockResolvedValue(10000);

      const result = await service.preview(userId, { vodPackageIds: ['v1'], couponCode: 'SAVE10' });

      expect(result.subTotal).toBe(80000);
      expect(result.discountTotal).toBe(10000);
      expect(result.grandTotal).toBe(70000);
    });
  });

  describe('checkout and handlePaymentRedirect', () => {
    const userId = 'user-1';
    const previewData = {
      subTotal: 100,
      discountTotal: 10,
      grandTotal: 90,
      vodPackages: [{ id: 'v1', price: 100 }],
      cohorts: [],
      liveClasses: [],
      subscriptionPlans: [],
      couponId: null,
      cohortToLiveClass: new Map(),
    };

    it('should create order and return PayOS link if selected', async () => {
      jest.spyOn(service, 'preview' as any).mockResolvedValue(previewData);
      mockPrisma.order.create.mockResolvedValue({ id: 'o1', code: 'ORD-1', metadata: {} });
      mockPayOS.createPaymentLink.mockResolvedValue({ checkoutUrl: 'http://payos/link' });

      const result = await service.checkout(userId, { paymentMethod: PaymentMethod.PAYOS, vodPackageIds: ['v1'] });

      expect((result as any).paymentUrl).toBe('http://payos/link');
      expect(mockPrisma.order.create).toHaveBeenCalled();
    });

    it('should handle Coin payment success', async () => {
      jest.spyOn(service, 'preview' as any).mockResolvedValue(previewData);
      const order = { id: 'o1', code: 'ORD-1', grandTotal: 90, userId, items: [], metadata: {} };
      mockPrisma.order.create.mockResolvedValue(order);
      mockPrisma.order.findUnique.mockResolvedValue({ status: 'PENDING' });
      mockPrisma.user.findUnique.mockResolvedValue({ id: userId, walletBalance: 1000 });
      mockPrisma.user.updateMany.mockResolvedValue({ count: 1 }); // Atomic deduction success

      const result = await service.checkout(userId, { paymentMethod: PaymentMethod.COIN, vodPackageIds: ['v1'] });

      expect((result as any).success).toBe(true);
      expect(mockPrisma.order.update).toHaveBeenCalledWith(expect.objectContaining({
          data: expect.objectContaining({ status: OrderStatus.PAID })
      }));
    });

    it('should throw if insufficient coins for payment', async () => {
        jest.spyOn(service, 'preview' as any).mockResolvedValue(previewData);
        const order = { id: 'o1', code: 'ORD-1', grandTotal: 90, userId, items: [], metadata: {} };
        mockPrisma.order.create.mockResolvedValue(order);
        mockPrisma.order.findUnique.mockResolvedValue({ status: 'PENDING' });
        mockPrisma.user.findUnique.mockResolvedValue({ id: userId, walletBalance: 10 });
        mockPrisma.user.updateMany.mockResolvedValue({ count: 0 }); // Atomic deduction failure

        await expect(service.checkout(userId, { paymentMethod: PaymentMethod.COIN, vodPackageIds: ['v1'] }))
            .rejects.toThrow('Số dư xu không đủ');
    });
  });

  describe('handlePaymentSuccess', () => {
    it('should throw if webhook signature invalid', async () => {
      mockPayOS.verifyPaymentWebhookData.mockReturnValue(false);
      await expect(service.handlePaymentSuccess('ORD-1', 'TX-1', { some: 'data' }))
        .rejects.toThrow('Invalid webhook signature');
    });

    it('should process payment and fulfill AI subscription', async () => {
      const order = { id: 'o1', code: 'ORD-1', status: 'PENDING', grandTotal: 100, userId: 'u1', items: [{ subscriptionPlanId: 's1' }] };
      mockPrisma.order.findUnique.mockResolvedValue(order);
      mockPrisma.aiUserSubscription.findFirst.mockResolvedValue(null); // No active sub

      await service.handlePaymentSuccess('ORD-1', 'TX-1');

      expect(mockPrisma.order.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ status: OrderStatus.PAID })
      }));
      expect(mockPrisma.aiUserSubscription.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ planId: 's1', status: 'ACTIVE' })
      }));
    });
  });
});
