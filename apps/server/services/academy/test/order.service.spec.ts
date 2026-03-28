import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from '../src/modules/commerce/order/order.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { AppConfigService } from '@server/shared';
import { AuditLoggerService } from '../src/modules/audit-logger.service';
import { CouponService } from '../src/modules/commerce/coupon.service';
import { AiSubscriptionService } from '../src/modules/commerce/quota/ai-subscription.service';
import { EnrollmentService } from '../src/modules/classroom/enrollment/enrollment.service';
import { PayOSService } from '../src/modules/commerce/payos.service';
import { OrderStatus } from '@prisma/generated';

describe('OrderService', () => {
  let service: OrderService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      order: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn().mockResolvedValue(0),
        aggregate: jest.fn().mockResolvedValue({ _sum: { grandTotal: 0 } }),
      },
      orderItem: { createMany: jest.fn() },
      aiUserSubscription: { findFirst: jest.fn(), update: jest.fn() },
      $transaction: jest.fn(async (cb) => cb(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: prisma },
        { provide: CouponService, useValue: { validateAndApply: jest.fn() } },
        { provide: AuditLoggerService, useValue: { log: jest.fn() } },
        { provide: AppConfigService, useValue: { get: jest.fn() } },
        { provide: AiSubscriptionService, useValue: { activateSubscription: jest.fn() } },
        { provide: EnrollmentService, useValue: { create: jest.fn() } },
        { provide: PayOSService, useValue: { createPaymentLink: jest.fn() } },
        { provide: 'NATS_SERVICE', useValue: { emit: jest.fn() } },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  describe('admin and repay exhaustive', () => {
    it('should return stats for revenue', async () => {
      prisma.order.count.mockResolvedValue(100);
      prisma.order.aggregate.mockResolvedValue({ _sum: { grandTotal: 1000000 } });
      const stats = await service.admin_getStats({ status: OrderStatus.PAID });
      expect(stats.totalRevenue).toBe(1000000);
    });

    it('should throw if order is expired on repay', async () => {
      prisma.order.findUnique.mockResolvedValue({ 
        id: 'o1', status: 'PENDING', 
        createdAt: new Date(Date.now() - 3600000) // 1 hour ago
      });
      await expect(service.repayOrder('o1', 'u1'))
        .rejects.toThrow('15 phút');
    });
  });
});
