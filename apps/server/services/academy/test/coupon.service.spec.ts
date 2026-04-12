import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CouponService } from '../src/modules/commerce/coupon.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { AuditLoggerService } from '../src/modules/audit-logger.service';
import { CouponStatus, CouponDiscountType, CouponScope } from '@prisma/generated';

describe('CouponService', () => {
  let service: CouponService;
  let mockPrisma: any;
  let mockAudit: any;

  beforeEach(async () => {
    mockPrisma = {
      coupon: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      couponUsage: {
        count: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
      },
      order: {
        count: jest.fn(),
      },
    };

    mockAudit = {
      log: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditLoggerService, useValue: mockAudit },
      ],
    }).compile();

    service = module.get<CouponService>(CouponService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateCoupon', () => {
    it('should throw if coupon code does not exist', async () => {
      mockPrisma.coupon.findUnique.mockResolvedValue(null);
      await expect(service.validateCoupon('INVALID', 'u1', 100, [])).rejects.toThrow(NotFoundException);
    });

    it('should throw if coupon is owned by someone else', async () => {
      mockPrisma.coupon.findUnique.mockResolvedValue({ 
          code: 'MYCODE', ownerId: 'u2', status: CouponStatus.ACTIVE 
      });
      await expect(service.validateCoupon('MYCODE', 'u1', 100, [])).rejects.toThrow('không áp dụng cho tài khoản của bạn');
    });

    it('should throw if expired', async () => {
        const past = new Date();
        past.setDate(past.getDate() - 1);
        mockPrisma.coupon.findUnique.mockResolvedValue({ 
            code: 'OLD', status: CouponStatus.ACTIVE, endDate: past, ownerId: null 
        });
        await expect(service.validateCoupon('OLD', 'u1', 100, [])).rejects.toThrow('Coupon has expired');
    });

    it('should throw if usage limit reached', async () => {
        mockPrisma.coupon.findUnique.mockResolvedValue({ 
            code: 'FULL', status: CouponStatus.ACTIVE, usageLimit: 10, usageCount: 10, ownerId: null 
        });
        await expect(service.validateCoupon('FULL', 'u1', 100, [])).rejects.toThrow('usage limit reached');
    });

    it('should throw if per-user limit reached', async () => {
        mockPrisma.coupon.findUnique.mockResolvedValue({ 
            id: 'c1', code: 'USERFULL', status: CouponStatus.ACTIVE, perUserLimit: 1, ownerId: null 
        });
        mockPrisma.couponUsage.count.mockResolvedValue(1);
        await expect(service.validateCoupon('USERFULL', 'u1', 100, [])).rejects.toThrow('reached the usage limit for this coupon');
    });

    it('should validate correctly for valid coupon', async () => {
        mockPrisma.coupon.findUnique.mockResolvedValue({ 
            id: 'c1', code: 'VALID', status: CouponStatus.ACTIVE, 
            ownerId: null, perUserLimit: 10, usageLimit: null, 
            minOrderValue: 50, scope: CouponScope.GLOBAL 
        });
        mockPrisma.couponUsage.count.mockResolvedValue(0);
        
        const result = await service.validateCoupon('VALID', 'u1', 100, []);
        expect(result.code).toBe('VALID');
    });
  });

  describe('calculateDiscount', () => {
    it('should calculate percentage discount with cap', async () => {
      mockPrisma.coupon.findUnique.mockResolvedValue({
        discountType: CouponDiscountType.PERCENTAGE,
        discountValue: 10,
        maxDiscountAmount: 5,
      });

      const discount = await service.calculateDiscount('c1', 100);
      expect(discount).toBe(5); // 10% of 100 is 10, but capped at 5
    });

    it('should calculate fixed amount discount', async () => {
        mockPrisma.coupon.findUnique.mockResolvedValue({
          discountType: CouponDiscountType.FIXED_AMOUNT,
          discountValue: 20,
        });
  
        const discount = await service.calculateDiscount('c1', 100);
        expect(discount).toBe(20);
    });

    it('should not discount more than order value', async () => {
        mockPrisma.coupon.findUnique.mockResolvedValue({
          discountType: CouponDiscountType.FIXED_AMOUNT,
          discountValue: 200,
        });
  
        const discount = await service.calculateDiscount('c1', 100);
        expect(discount).toBe(100);
    });
  });

  describe('admin_delete', () => {
    it('should deactivate instead of delete if coupon has been used', async () => {
      mockPrisma.coupon.findUnique.mockResolvedValue({ 
          id: 'c1', code: 'USED', ownerId: null, source: 'MANUAL',
          _count: { usages: 1 } 
      });
      mockPrisma.order.count.mockResolvedValue(0);

      await service.admin_delete('c1');

      expect(mockPrisma.coupon.update).toHaveBeenCalledWith(expect.objectContaining({
          data: { status: CouponStatus.INACTIVE }
      }));
      expect(mockPrisma.coupon.delete).not.toHaveBeenCalled();
    });

    it('should delete if coupon has never been used', async () => {
        mockPrisma.coupon.findUnique.mockResolvedValue({ 
            id: 'c1', code: 'NEW', ownerId: null, source: 'MANUAL',
            _count: { usages: 0 } 
        });
        mockPrisma.order.count.mockResolvedValue(0);
  
        await service.admin_delete('c1');
  
        expect(mockPrisma.coupon.delete).toHaveBeenCalled();
      });
  });
});
