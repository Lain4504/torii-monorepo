import { Test, TestingModule } from '@nestjs/testing';
import { CouponService } from '../src/modules/commerce/coupon.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { AuditLoggerService } from '../src/modules/audit-logger.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CouponStatus, CouponDiscountType, CouponScope } from '@prisma/generated';

describe('CouponService', () => {
  let service: CouponService;
  let prisma: any;

  beforeEach(async () => {
    const mockPrisma = {
      coupon: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      couponUsage: {
        count: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
      },
      order: { count: jest.fn() },
    };

    const mockAudit = { log: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditLoggerService, useValue: mockAudit },
      ],
    }).compile();

    service = module.get<CouponService>(CouponService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('validateCoupon exhaustive', () => {
    it('should throw if coupon is scheduled for future (startDate)', async () => {
      prisma.coupon.findUnique.mockResolvedValue({ 
        status: CouponStatus.ACTIVE, 
        startDate: new Date(Date.now() + 100000) 
      });
      await expect(service.validateCoupon('FUTURE', 'u1', 100, [])).rejects.toThrow('not yet valid');
    });

    it('should throw if usage count exceeds limit exactly after one more', async () => {
      prisma.coupon.findUnique.mockResolvedValue({ 
        status: CouponStatus.ACTIVE, 
        usageLimit: 5, 
        usageCount: 5 
      });
      await expect(service.validateCoupon('LIMIT', 'u1', 100, [])).rejects.toThrow('usage limit reached');
    });

    it('should allow global scope even with specific offering list', async () => {
      prisma.coupon.findUnique.mockResolvedValue({ 
        status: CouponStatus.ACTIVE, 
        scope: CouponScope.GLOBAL 
      });
      const result = await service.validateCoupon('GLOBAL', 'u1', 100, ['p1']);
      expect(result).toBeDefined();
    });
  });

  describe('calculateDiscount edge cases', () => {
    it('should cap discount amount correctly', async () => {
      prisma.coupon.findUnique.mockResolvedValue({
        discountType: CouponDiscountType.PERCENTAGE,
        discountValue: 50,
        maxDiscountAmount: 100
      });
      // 50% of 1000 is 500, capped at 100
      expect(await service.calculateDiscount('c1', 1000)).toBe(100);
    });

    it('should handle 100% discount', async () => {
      prisma.coupon.findUnique.mockResolvedValue({
        discountType: CouponDiscountType.PERCENTAGE,
        discountValue: 100
      });
      expect(await service.calculateDiscount('c1', 500)).toBe(500);
    });

    it('should handle zero discount', async () => {
      prisma.coupon.findUnique.mockResolvedValue({
        discountType: CouponDiscountType.PERCENTAGE,
        discountValue: 0
      });
      expect(await service.calculateDiscount('c1', 500)).toBe(0);
    });
  });

  describe('recordUsage concurrency/transaction', () => {
    it('should update coupon and usage in provided transaction', async () => {
      const tx = {
        coupon: { update: jest.fn().mockResolvedValue({ usageCount: 1 }) },
        couponUsage: { create: jest.fn() }
      };
      await service.recordUsage(tx as any, 'c1', 'u1', 'o1');
      expect(tx.coupon.update).toHaveBeenCalled();
      expect(tx.couponUsage.create).toHaveBeenCalled();
    });
  });
});
