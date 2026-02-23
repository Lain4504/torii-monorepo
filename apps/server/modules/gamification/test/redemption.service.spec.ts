import { Test, TestingModule } from '@nestjs/testing';
import { RedemptionService } from '../src/services/redemption.service';
import { PrismaService } from '@server/shared';
import { BadRequestException } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('RedemptionService', () => {
    let service: RedemptionService;
    let prisma: any;
    let natsClient: any;

    const mockUserId = 'user-123';
    const mockRewardId = 'reward-456';

    beforeEach(async () => {
        const mockPrismaService = {
            pointReward: {
                findUnique: jest.fn(),
                findMany: jest.fn(),
            },
            userGamification: {
                findUnique: jest.fn(),
                update: jest.fn(),
            },
        };

        const mockNatsClient = {
            send: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RedemptionService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService as any,
                },
                {
                    provide: 'NATS_SERVICE',
                    useValue: mockNatsClient as any,
                },
            ],
        }).compile();

        service = module.get<RedemptionService>(RedemptionService);
        prisma = module.get(PrismaService);
        natsClient = module.get('NATS_SERVICE');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('redeemPoints', () => {
        const mockReward = {
            id: mockRewardId,
            name: 'Discount Coupon',
            points: 100,
            discountType: 'fixed',
            discountValue: 50000,
            validDuration: 30,
            isActive: true,
        };

        const mockGamification = {
            userId: mockUserId,
            points: 500,
        };

        it('should successfully redeem points and request coupon creation', async () => {
            prisma.pointReward.findUnique.mockResolvedValue(mockReward);
            prisma.userGamification.findUnique.mockResolvedValue(mockGamification);
            prisma.userGamification.update.mockResolvedValue({});

            const mockCoupon = { code: 'PROMO123', id: 'coupon-1' };
            natsClient.send.mockReturnValue(of(mockCoupon));

            const result = await service.redeemPoints(mockUserId, mockRewardId);

            expect(prisma.userGamification.update).toHaveBeenCalledWith(expect.objectContaining({
                data: { points: { decrement: mockReward.points } }
            }));
            expect(natsClient.send).toHaveBeenCalledWith('billing.coupon.createRedeemed', expect.any(Object));
            expect(result.success).toBe(true);
            expect(result.couponCode).toBe('PROMO123');
        });

        it('should throw error if reward is not found or inactive', async () => {
            prisma.pointReward.findUnique.mockResolvedValue(null);

            await expect(service.redeemPoints(mockUserId, mockRewardId))
                .rejects.toThrow(BadRequestException);

            expect(prisma.userGamification.update).not.toHaveBeenCalled();
        });

        it('should throw error if user has insufficient points', async () => {
            prisma.pointReward.findUnique.mockResolvedValue(mockReward);
            prisma.userGamification.findUnique.mockResolvedValue({ points: 50 }); // Less than 100

            await expect(service.redeemPoints(mockUserId, mockRewardId))
                .rejects.toThrow('Bạn không đủ điểm để đổi quà này');
        });

        it('should rollback points if coupon creation fails', async () => {
            prisma.pointReward.findUnique.mockResolvedValue(mockReward);
            prisma.userGamification.findUnique.mockResolvedValue(mockGamification);

            // First update (deduct) succeeds, NATS fails
            natsClient.send.mockReturnValue(throwError(() => new Error('NATS error')));

            await expect(service.redeemPoints(mockUserId, mockRewardId))
                .rejects.toThrow(BadRequestException);

            // Verify rollback
            expect(prisma.userGamification.update).toHaveBeenCalledWith(expect.objectContaining({
                data: { points: { increment: mockReward.points } }
            }));
        });
    });

    describe('getAvailableRewards', () => {
        it('should return mapped rewards', async () => {
            const mockRewards = [
                {
                    id: '1',
                    name: 'R1',
                    points: 100,
                    discountType: 'percentage',
                    discountValue: 10,
                    isActive: true,
                    description: 'Desc',
                    maxDiscountAmount: 50,
                    minOrderAmount: 200,
                    validDuration: 7
                }
            ];
            prisma.pointReward.findMany.mockResolvedValue(mockRewards);

            const result = await service.getAvailableRewards();

            expect(result).toHaveLength(1);
            expect(result[0].pointsContent).toBe('100 Points');
            expect(result[0].type).toBe('percentage');
        });
    });
});
