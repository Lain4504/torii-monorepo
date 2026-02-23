import { Test, TestingModule } from '@nestjs/testing';
import { UserBalanceService } from '../src/modules/user-balance/user-balance.service';
import { UserBalanceRepository } from '../src/modules/user-balance/user-balance.repository';
import { PrismaService } from '@server/shared';
import { BadRequestException } from '@nestjs/common';
import { BalanceTransactionType } from '@prisma/generated';

describe('UserBalanceService', () => {
    let service: UserBalanceService;
    let repository: any;
    let prisma: any;

    const mockUserId = 'test-user-id';
    const mockBalance = 1000;

    beforeEach(async () => {
        const mockRepository = {
            findByUserId: jest.fn(),
            create: jest.fn(),
            updateBalance: jest.fn(),
        };

        const mockPrismaService = {
            balanceTransaction: {
                create: jest.fn(),
                findMany: jest.fn(),
                count: jest.fn(),
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserBalanceService,
                {
                    provide: UserBalanceRepository,
                    useValue: mockRepository as any,
                },
                {
                    provide: PrismaService,
                    useValue: mockPrismaService as any,
                },
            ],
        }).compile();

        service = module.get<UserBalanceService>(UserBalanceService);
        repository = module.get(UserBalanceRepository);
        prisma = module.get(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getBalance', () => {
        it('should return balance if user balance exists', async () => {
            repository.findByUserId.mockResolvedValue({ userId: mockUserId, balance: mockBalance } as any);

            const result = await service.getBalance(mockUserId);

            expect(repository.findByUserId).toHaveBeenCalledWith(mockUserId);
            expect(result).toBe(mockBalance);
        });

        it('should create and return balance if user balance does not exist', async () => {
            repository.findByUserId.mockResolvedValue(null);
            repository.create.mockResolvedValue({ userId: mockUserId, balance: 0 } as any);

            const result = await service.getBalance(mockUserId);

            expect(repository.findByUserId).toHaveBeenCalledWith(mockUserId);
            expect(repository.create).toHaveBeenCalledWith(mockUserId);
            expect(result).toBe(0);
        });
    });

    describe('addBalance', () => {
        it('should add balance and log transaction for existing user', async () => {
            const amount = 500.5;
            const roundedAmount = 501;
            const reason = 'test reason';

            repository.findByUserId.mockResolvedValue({ userId: mockUserId, balance: mockBalance } as any);

            const result = await service.addBalance(mockUserId, amount, reason);

            expect(repository.updateBalance).toHaveBeenCalledWith(mockUserId, roundedAmount);
            expect(prisma.balanceTransaction.create).toHaveBeenCalledWith({
                data: {
                    userId: mockUserId,
                    amount: roundedAmount,
                    type: BalanceTransactionType.OTHER,
                    description: reason,
                    metadata: {},
                }
            });
            expect(result).toBe(true);
        });

        it('should create balance and log transaction for new user', async () => {
            repository.findByUserId.mockResolvedValue(null);

            const result = await service.addBalance(mockUserId, 100, 'new user');

            expect(repository.create).toHaveBeenCalledWith(mockUserId, 100);
            expect(prisma.balanceTransaction.create).toHaveBeenCalled();
            expect(result).toBe(true);
        });
    });

    describe('deductBalance', () => {
        it('should deduct balance and log transaction if sufficient funds', async () => {
            repository.findByUserId.mockResolvedValue({ userId: mockUserId, balance: 1000 } as any);

            const result = await service.deductBalance(mockUserId, 200, 'purchase');

            expect(repository.updateBalance).toHaveBeenCalledWith(mockUserId, -200);
            expect(prisma.balanceTransaction.create).toHaveBeenCalledWith({
                data: {
                    userId: mockUserId,
                    amount: -200,
                    type: BalanceTransactionType.PURCHASE,
                    description: 'purchase',
                    metadata: {},
                }
            });
            expect(result).toBe(true);
        });

        it('should throw BadRequestException if insufficient funds', async () => {
            repository.findByUserId.mockResolvedValue({ userId: mockUserId, balance: 100 } as any);

            await expect(service.deductBalance(mockUserId, 200, 'expensive purchase'))
                .rejects.toThrow(BadRequestException);

            expect(repository.updateBalance).not.toHaveBeenCalled();
        });
    });

    describe('getHistory', () => {
        it('should return paginated history', async () => {
            const mockData = [{ id: '1' }, { id: '2' }];
            const mockTotal = 2;
            const query = { page: '1', limit: '10' };

            prisma.balanceTransaction.findMany.mockResolvedValue(mockData as any);
            prisma.balanceTransaction.count.mockResolvedValue(mockTotal);

            const result = await service.getHistory(mockUserId, query);

            expect(prisma.balanceTransaction.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { userId: mockUserId },
                skip: 0,
                take: 10,
            }));
            expect(result.data).toEqual(mockData);
            expect(result.total).toBe(mockTotal);
            expect(result.page).toBe(1);
        });

        it('should filter by type if provided', async () => {
            const query = { type: BalanceTransactionType.TOP_UP };

            prisma.balanceTransaction.findMany.mockResolvedValue([]);
            prisma.balanceTransaction.count.mockResolvedValue(0);

            await service.getHistory(mockUserId, query);

            expect(prisma.balanceTransaction.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { userId: mockUserId, type: BalanceTransactionType.TOP_UP }
            }));
        });
    });
});
