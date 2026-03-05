import { Test, TestingModule } from '@nestjs/testing';
import { CouponService } from '../src/modules/coupon/coupon.service';
import { CouponRepository } from '../src/modules/coupon/coupon.repository';
import { REDIS_CLIENT } from '@server/shared';
import { CouponStatus, CouponDiscountType } from '@workspace/schemas';
import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';

describe('CouponService', () => {
  let service: CouponService;
  let couponRepository: jest.Mocked<CouponRepository>;
  let redisClient: any;

  const mockCoupon = {
    id: 'coupon-1',
    code: 'TEST-CODE',
    name: 'Test Coupon',
    discountType: CouponDiscountType.PERCENTAGE,
    discountValue: 10,
    maxDiscountAmount: 100,
    minOrderAmount: 50,
    validFrom: new Date(Date.now() - 86400000), // Yesterday
    validUntil: new Date(Date.now() + 86400000), // Tomorrow
    usageLimit: 100,
    usageCount: 0,
    userUsageLimit: 1,
    status: CouponStatus.ACTIVE,
    userId: null,
  };

  beforeEach(async () => {
    const mockCouponRepository = {
      findByCode: jest.fn(),
      findById: jest.fn(),
      incrementUsage: jest.fn(),
      decrementUsage: jest.fn(),
      checkUserUsage: jest.fn(),
      create: jest.fn(),
      findCouponsForUser: jest.fn(),
    };

    const mockRedisClient = {
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CouponService,
        {
          provide: CouponRepository,
          useValue: mockCouponRepository,
        },
        {
          provide: REDIS_CLIENT,
          useValue: mockRedisClient,
        },
      ],
    }).compile();

    service = module.get<CouponService>(CouponService);
    couponRepository = module.get(CouponRepository);
    redisClient = module.get(REDIS_CLIENT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateCoupon', () => {
    const userId = 'user-1';
    const orderAmount = 100;

    it('should return valid if coupon exists and and meets all conditions', async () => {
      couponRepository.findByCode.mockResolvedValue(mockCoupon as any);
      couponRepository.checkUserUsage.mockResolvedValue(0);

      const result = await service.validateCoupon(
        'TEST-CODE',
        userId,
        orderAmount,
      );

      expect(result.isValid).toBe(true);
      expect(result.discountAmount).toBe(10); // 10% of 100
      expect(result.message).toBe('Coupon is valid');
    });

    it('should return invalid if coupon not found', async () => {
      couponRepository.findByCode.mockResolvedValue(null);

      const result = await service.validateCoupon(
        'INVALID',
        userId,
        orderAmount,
      );

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Coupon not found');
    });

    it('should return invalid if coupon is not active', async () => {
      couponRepository.findByCode.mockResolvedValue({
        ...mockCoupon,
        status: CouponStatus.INACTIVE,
      } as any);

      const result = await service.validateCoupon(
        'TEST-CODE',
        userId,
        orderAmount,
      );

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Coupon is not active');
    });

    it('should return invalid if coupon is expired', async () => {
      couponRepository.findByCode.mockResolvedValue({
        ...mockCoupon,
        validUntil: new Date(Date.now() - 1000),
      } as any);

      const result = await service.validateCoupon(
        'TEST-CODE',
        userId,
        orderAmount,
      );

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Coupon is expired or not yet valid');
    });

    it('should return invalid if global usage limit reached', async () => {
      couponRepository.findByCode.mockResolvedValue({
        ...mockCoupon,
        usageLimit: 10,
        usageCount: 10,
      } as any);

      const result = await service.validateCoupon(
        'TEST-CODE',
        userId,
        orderAmount,
      );

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Coupon usage limit reached');
    });

    it('should return invalid if order amount is below minimum', async () => {
      couponRepository.findByCode.mockResolvedValue({
        ...mockCoupon,
        minOrderAmount: 200,
      } as any);

      const result = await service.validateCoupon('TEST-CODE', userId, 100);

      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Minimum order amount');
    });

    it('should return invalid if coupon belongs to another user', async () => {
      couponRepository.findByCode.mockResolvedValue({
        ...mockCoupon,
        userId: 'other-user',
      } as any);

      const result = await service.validateCoupon(
        'TEST-CODE',
        userId,
        orderAmount,
      );

      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Mã giảm giá không thuộc về bạn');
    });

    it('should return invalid if user usage limit reached', async () => {
      couponRepository.findByCode.mockResolvedValue(mockCoupon as any);
      couponRepository.checkUserUsage.mockResolvedValue(1); // Limit is 1

      const result = await service.validateCoupon(
        'TEST-CODE',
        userId,
        orderAmount,
      );

      expect(result.isValid).toBe(false);
      expect(result.message).toBe(
        'You have reached the usage limit for this coupon',
      );
    });

    it('should handle database error during findByCode', async () => {
      couponRepository.findByCode.mockRejectedValue(new Error('Fetch Error'));
      await expect(service.validateCoupon('CODE', userId, 100)).rejects.toThrow(
        'Fetch Error',
      );
    });

    it('should handle database error during checkUserUsage', async () => {
      couponRepository.findByCode.mockResolvedValue(mockCoupon as any);
      couponRepository.checkUserUsage.mockRejectedValue(
        new Error('Usage Check Error'),
      );
      await expect(service.validateCoupon('CODE', userId, 100)).rejects.toThrow(
        'Usage Check Error',
      );
    });

    it('should be valid if now is exactly validFrom', async () => {
      const now = new Date();
      couponRepository.findByCode.mockResolvedValue({
        ...mockCoupon,
        validFrom: now,
        validUntil: new Date(now.getTime() + 100000),
      } as any);
      couponRepository.checkUserUsage.mockResolvedValue(0);

      const result = await service.validateCoupon('CODE', userId, 100);
      expect(result.isValid).toBe(true);
    });
  });

  describe('redeemCoupon', () => {
    const userId = 'user-1';
    const orderAmount = 100;
    const code = 'TEST-CODE';

    it('should redeem coupon successfully', async () => {
      redisClient.set.mockResolvedValue('OK');
      // Mock validateCoupon indirectly by mocking repo calls it makes
      couponRepository.findByCode.mockResolvedValue(mockCoupon as any);
      couponRepository.checkUserUsage.mockResolvedValue(0);
      couponRepository.incrementUsage.mockResolvedValue({} as any);

      const result = await service.redeemCoupon(code, userId, orderAmount);

      expect(result.couponId).toBe(mockCoupon.id);
      expect(result.discountAmount).toBe(10);
      expect(redisClient.set).toHaveBeenCalled();
      expect(redisClient.del).toHaveBeenCalled();
      expect(couponRepository.incrementUsage).toHaveBeenCalledWith(
        mockCoupon.id,
      );
    });

    it('should throw ConflictException if lock not acquired', async () => {
      redisClient.set.mockResolvedValue(null);

      await expect(
        service.redeemCoupon(code, userId, orderAmount),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException if validation fails', async () => {
      redisClient.set.mockResolvedValue('OK');
      couponRepository.findByCode.mockResolvedValue({
        ...mockCoupon,
        status: CouponStatus.INACTIVE,
      } as any);

      await expect(
        service.redeemCoupon(code, userId, orderAmount),
      ).rejects.toThrow(BadRequestException);
      expect(redisClient.del).toHaveBeenCalled(); // Ensure lock is released even on error
    });

    it('should throw InternalServerErrorException if coupon is missing after validation', async () => {
      redisClient.set.mockResolvedValue('OK');
      // Mock validateCoupon to return isValid: true but no coupon
      jest
        .spyOn(service, 'validateCoupon')
        .mockResolvedValue({ isValid: true } as any);

      await expect(
        service.redeemCoupon(code, userId, orderAmount),
      ).rejects.toThrow(InternalServerErrorException);
      expect(redisClient.del).toHaveBeenCalled();
    });

    it('should throw error if incrementUsage fails and release lock', async () => {
      redisClient.set.mockResolvedValue('OK');
      couponRepository.findByCode.mockResolvedValue(mockCoupon as any);
      couponRepository.checkUserUsage.mockResolvedValue(0);
      couponRepository.incrementUsage.mockRejectedValue(
        new Error('Increment Failed'),
      );

      await expect(
        service.redeemCoupon(code, userId, orderAmount),
      ).rejects.toThrow('Increment Failed');
      expect(redisClient.del).toHaveBeenCalled();
    });
  });

  describe('calculateDiscount', () => {
    it('should calculate percentage discount correctly', () => {
      const coupon = {
        discountType: CouponDiscountType.PERCENTAGE,
        discountValue: 10,
        maxDiscountAmount: 100,
      };
      const result = service.calculateDiscount(200, coupon);
      expect(result.discountAmount).toBe(20);
      expect(result.finalPrice).toBe(180);
    });

    it('should cap percentage discount by maxDiscountAmount', () => {
      const coupon = {
        discountType: CouponDiscountType.PERCENTAGE,
        discountValue: 10,
        maxDiscountAmount: 5,
      };
      const result = service.calculateDiscount(100, coupon);
      expect(result.discountAmount).toBe(5);
      expect(result.finalPrice).toBe(95);
    });

    it('should calculate fixed discount correctly', () => {
      const coupon = {
        discountType: CouponDiscountType.FIXED_AMOUNT,
        discountValue: 50,
      };
      const result = service.calculateDiscount(200, coupon);
      expect(result.discountAmount).toBe(50);
      expect(result.finalPrice).toBe(150);
    });

    it('should cap discount by order amount', () => {
      const coupon = {
        discountType: CouponDiscountType.FIXED_AMOUNT,
        discountValue: 300,
      };
      const result = service.calculateDiscount(200, coupon);
      expect(result.discountAmount).toBe(200);
      expect(result.finalPrice).toBe(0);
    });
  });

  describe('releaseCoupon', () => {
    it('should decrement usage', async () => {
      couponRepository.decrementUsage.mockResolvedValue({} as any);

      await service.releaseCoupon('coupon-1');

      expect(couponRepository.decrementUsage).toHaveBeenCalledWith('coupon-1');
    });

    it('should not throw if repo fails', async () => {
      couponRepository.decrementUsage.mockRejectedValue(new Error('DB Error'));

      await expect(service.releaseCoupon('coupon-1')).resolves.not.toThrow();
    });
  });

  describe('createRedeemedCoupon', () => {
    it('should call repository create with correct data', async () => {
      const data = {
        userId: 'user-1',
        name: 'Welcome Coupon',
        discountType: CouponDiscountType.FIXED_AMOUNT,
        discountValue: 50,
        validDurationDays: 7,
      };

      await service.createRedeemedCoupon(data);

      expect(couponRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Welcome Coupon',
          discountType: CouponDiscountType.FIXED_AMOUNT,
          discountValue: 50,
          status: CouponStatus.ACTIVE,
          userUsageLimit: 1,
          usageLimit: 1,
          user: { connect: { id: 'user-1' } },
        }),
      );
    });

    it('should throw error if repository create fails', async () => {
      couponRepository.create.mockRejectedValue(new Error('Creation Failed'));
      await expect(service.createRedeemedCoupon({} as any)).rejects.toThrow(
        'Creation Failed',
      );
    });
  });

  describe('getCouponsForUser', () => {
    const userId = 'user-1';

    it('should return available coupons for user', async () => {
      const mockCoupons = [
        { id: 'c1', userId: userId, status: CouponStatus.ACTIVE }, // Personal
        {
          id: 'c2',
          userId: null,
          status: CouponStatus.ACTIVE,
          userUsageLimit: 1,
        }, // Public
        {
          id: 'c3',
          userId: null,
          status: CouponStatus.ACTIVE,
          usageLimit: 10,
          usageCount: 10,
        }, // Global limit reached
      ];

      couponRepository.findCouponsForUser.mockResolvedValue(mockCoupons as any);
      couponRepository.checkUserUsage.mockImplementation(async (uid, cid) => {
        if (cid === 'c2') return 0;
        return 0;
      });

      const result = await service.getCouponsForUser(userId);

      expect(result).toHaveLength(2);
      expect(result.map((c) => c.id)).toContain('c1');
      expect(result.map((c) => c.id)).toContain('c2');
      expect(result.map((c) => c.id)).not.toContain('c3');
    });

    it('should filter out coupons where user reached limit', async () => {
      const mockCoupons = [
        {
          id: 'c2',
          userId: null,
          status: CouponStatus.ACTIVE,
          userUsageLimit: 1,
        },
      ];

      couponRepository.findCouponsForUser.mockResolvedValue(mockCoupons as any);
      couponRepository.checkUserUsage.mockResolvedValue(1);

      const result = await service.getCouponsForUser(userId);

      expect(result).toHaveLength(0);
    });

    it('should throw error if findCouponsForUser fails', async () => {
      couponRepository.findCouponsForUser.mockRejectedValue(
        new Error('Fetch Error'),
      );
      await expect(service.getCouponsForUser(userId)).rejects.toThrow(
        'Fetch Error',
      );
    });

    it('should throw error if checkUserUsage fails during filtering', async () => {
      couponRepository.findCouponsForUser.mockResolvedValue([
        { id: 'c1', userUsageLimit: 1 },
      ] as any);
      couponRepository.checkUserUsage.mockRejectedValue(
        new Error('Check Error'),
      );
      await expect(service.getCouponsForUser(userId)).rejects.toThrow(
        'Check Error',
      );
    });
  });
});
