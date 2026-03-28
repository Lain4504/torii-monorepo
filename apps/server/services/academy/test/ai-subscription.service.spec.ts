import { Test, TestingModule } from '@nestjs/testing';
import { AiSubscriptionService } from '../src/modules/commerce/quota/ai-subscription.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';

describe('AiSubscriptionService', () => {
  let service: AiSubscriptionService;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      aiSubscriptionPlan: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      aiUserSubscription: {
        findFirst: jest.fn(),
        updateMany: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
        update: jest.fn(),
      },
      $transaction: jest.fn(async (cb) => cb(prisma)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiSubscriptionService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<AiSubscriptionService>(AiSubscriptionService);
  });

  describe('getActiveSubscription Exhaustive', () => {
    it('should return null if no active sub exists or is expired', async () => {
      prisma.aiUserSubscription.findFirst.mockResolvedValue(null);
      const result = await service.getActiveSubscription('u1');
      expect(result).toBeNull();
    });
  });

  describe('activateSubscription deeply', () => {
    it('should throw if plan not found', async () => {
      prisma.aiSubscriptionPlan.findUnique.mockResolvedValue(null);
      await expect(service.activateSubscription('u1', 'p1')).rejects.toThrow('Plan with ID p1 not found');
    });

    it('should deactivate existing subs and create new one', async () => {
      const plan = { id: 'p1', code: 'PRO' };
      prisma.aiSubscriptionPlan.findUnique.mockResolvedValue(plan);
      prisma.aiUserSubscription.create.mockResolvedValue({ id: 's2' });

      await service.activateSubscription('u1', 'p1');
      expect(prisma.aiUserSubscription.updateMany).toHaveBeenCalledWith({
        where: { userId: 'u1', status: 'ACTIVE' },
        data: { status: 'CANCELLED' }
      });
      expect(prisma.aiUserSubscription.create).toHaveBeenCalled();
    });
  });
});
