import { Test, TestingModule } from '@nestjs/testing';
import { CouponService } from '@server/learning/modules/coupon/coupon.service';
import { COUPON_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories';
import { getMapperToken } from '@automapper/nestjs';
import { of } from 'rxjs';
import { ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserRole, CouponStatus, CouponDiscountType } from '@workspace/schemas';

describe('CouponService', () => {
    let service: CouponService;
    let couponRepository: any;
    let natsClient: any;
    let mapper: any;

    const mockCoupon = {
        id: 'coupon-1',
        code: 'DISCOUNT50',
        name: '50% Off',
        discountType: CouponDiscountType.PERCENTAGE,
        discountValue: 50,
        status: CouponStatus.ACTIVE,
        validFrom: new Date(Date.now() - 86400000),
        validUntil: new Date(Date.now() + 86400000),
        usageCount: 0,
        usageLimit: 100,
        userUsageLimit: 1,
        applicableCourseIds: [],
        excludedCourseIds: [],
    };

    const mockRequester = {
        sub: 'admin-1',
        role: UserRole.ADMIN,
    };

    const mockCouponRepository = {
        count: jest.fn(),
        findMany: jest.fn(),
        findById: jest.fn(),
        findByCode: jest.fn(),
        codeExists: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        countUserUsage: jest.fn(),
        getTotalUsageCount: jest.fn(),
    };

    const mockNatsClient = {
        send: jest.fn(),
        emit: jest.fn(),
    };

    const mockMapper = {
        map: jest.fn().mockImplementation((val) => (val ? { ...val } : val)),
        mapArray: jest.fn().mockImplementation((arr) => arr.map(val => ({ ...val }))),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CouponService,
                {
                    provide: COUPON_REPOSITORY_TOKEN,
                    useValue: mockCouponRepository,
                },
                {
                    provide: 'NATS_SERVICE',
                    useValue: mockNatsClient,
                },
                {
                    provide: getMapperToken(),
                    useValue: mockMapper,
                },
            ],
        }).compile();

        service = module.get<CouponService>(CouponService);
        couponRepository = module.get(COUPON_REPOSITORY_TOKEN);
        natsClient = module.get('NATS_SERVICE');
        mapper = module.get(getMapperToken());

        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('findAll', () => {
        it('should return paginated coupons', async () => {
            mockCouponRepository.count.mockResolvedValue(1);
            mockCouponRepository.findMany.mockResolvedValue([mockCoupon]);

            const result = await service.findAll({ page: 1, limit: 10 });

            expect(result.data).toHaveLength(1);
            expect(result.total).toBe(1);
        });
    });

    describe('create', () => {
        const dto = {
            code: 'NEWCOUPON',
            name: 'New Coupon',
            discountType: CouponDiscountType.PERCENTAGE,
            discountValue: 10,
            validFrom: new Date(),
            validUntil: new Date(Date.now() + 100000),
        };

        it('should create coupon successfully', async () => {
            mockCouponRepository.codeExists.mockResolvedValue(false);
            mockCouponRepository.create.mockResolvedValue({ ...mockCoupon, code: 'NEWCOUPON' });

            const result = await service.create(mockRequester as any, dto as any);

            expect(result.code).toBe('NEWCOUPON');
            expect(couponRepository.create).toHaveBeenCalled();
            expect(natsClient.emit).toHaveBeenCalledWith({ cmd: 'identity.audit.log' }, expect.any(Object));
        });

        it('should throw ForbiddenException for unauthorized role', async () => {
            const studentRequester = { sub: 'u1', role: UserRole.LEARNER };
            await expect(service.create(studentRequester as any, dto as any))
                .rejects.toThrow(ForbiddenException);
        });

        it('should throw BadRequestException if code exists', async () => {
            mockCouponRepository.codeExists.mockResolvedValue(true);
            await expect(service.create(mockRequester as any, dto as any))
                .rejects.toThrow(BadRequestException);
        });
    });

    describe('validateCoupon', () => {
        it('should return valid: true for valid coupon', async () => {
            mockCouponRepository.findByCode.mockResolvedValue(mockCoupon);
            mockCouponRepository.findById.mockResolvedValue(mockCoupon);
            mockNatsClient.send.mockReturnValue(of({ price: 100000 })); // Mock course

            const result = await service.validateCoupon({ code: 'DISCOUNT50', courseId: 'course-1' });

            expect(result.isValid).toBe(true);
            expect(result.discountAmount).toBe(50000);
        });

        it('should return valid: false if coupon not found', async () => {
            mockCouponRepository.findByCode.mockResolvedValue(null);
            const result = await service.validateCoupon({ code: 'INVALID', courseId: 'course-1' });
            expect(result.isValid).toBe(false);
            expect(result.message).toContain('không tồn tại');
        });
    });
});
