import { Test, TestingModule } from '@nestjs/testing';
import { WalletService } from '../src/modules/wallet/wallet.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';

describe('WalletService', () => {
  let service: WalletService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
      },
      walletTransaction: {
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
  });

  describe('getBalance', () => {
    it('should return user wallet balance', async () => {
      prisma.user.findUnique.mockResolvedValue({ walletBalance: 500 });
      const balance = await service.getBalance('u1');
      expect(balance).toBe(500);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'u1' },
        select: { walletBalance: true },
      });
    });

    it('should return 0 if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const balance = await service.getBalance('u1');
      expect(balance).toBe(0);
    });
  });

  describe('getTransactions', () => {
    it('should return paginated transactions', async () => {
      const mockTx = [{ id: 't1', amount: 100 }];
      prisma.walletTransaction.findMany.mockResolvedValue(mockTx);
      prisma.walletTransaction.count.mockResolvedValue(1);

      const result = await service.getTransactions('u1', { page: 1, limit: 10 });
      expect(result.data).toEqual(mockTx);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should handle default pagination', async () => {
      await service.getTransactions('u1', {});
      expect(prisma.walletTransaction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 10 }),
      );
    });
  });
});
