import { Test, TestingModule } from '@nestjs/testing';
import { CouponService } from '../src/modules/coupon/coupon.service';
import { CouponRepository } from '../src/modules/coupon/coupon.repository';
import { REDIS_CLIENT } from '@server/shared';
import { CouponStatus, CouponDiscountType } from '@workspace/schemas';

describe('CouponService', () => {
    let service: CouponService;
    let repository: any;

    const mockCouponRepository = {
        findByCode: jest.fn(),
        create: jest.fn(),
    };

    const mockRedis = {
        set: jest.fn(),
        del: jest.fn(),
    };

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CouponService,
                { provide: CouponRepository, useValue: mockCouponRepository },
                { provide: REDIS_CLIENT, useValue: mockRedis },
            ],
        }).compile();

        service = module.get<CouponService>(CouponService);
        repository = module.get(CouponRepository);
    });

    describe('createRedeemedCoupon', () => {
        const dto = {
            userId: 'user-1',
            name: 'Test Coupon',
            discountType: CouponDiscountType.FIXED_AMOUNT,
            discountValue: 10000,
        };

        it('should generate a unique code and create coupon', async () => {
            repository.findByCode.mockResolvedValueOnce(null);
            repository.create.mockResolvedValue({ id: 'coupon-1', code: 'ABC-123' });

            const result = await service.createRedeemedCoupon(dto);

            expect(result).toBeDefined();
            expect(repository.findByCode).toHaveBeenCalled();
            expect(repository.create).toHaveBeenCalled();
        });

        it('should retry if code exists', async () => {
            repository.findByCode
                .mockResolvedValueOnce({ id: 'existing' }) // First attempt exists
                .mockResolvedValueOnce(null); // Second attempt unique
            
            repository.create.mockResolvedValue({ id: 'coupon-2' });

            await service.createRedeemedCoupon(dto);

            expect(repository.findByCode).toHaveBeenCalledTimes(2);
            expect(repository.create).toHaveBeenCalled();
        });

        it('should throw if fails after 10 attempts', async () => {
            repository.findByCode.mockResolvedValue({ id: 'existing' });

            await expect(service.createRedeemedCoupon(dto))
                .rejects.toThrow('Failed to generate a unique coupon code');
            
            expect(repository.findByCode).toHaveBeenCalledTimes(10);
        });
    });
});
