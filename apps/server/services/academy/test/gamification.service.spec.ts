import { Test, TestingModule } from '@nestjs/testing';
import { GamificationService } from '../src/modules/gamification/gamification.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { AchievementService } from '../src/modules/gamification/achievement.service';
import { AuditLoggerService } from '../src/modules/audit-logger.service';
import { ActivityType } from '@prisma/generated';

describe('GamificationService', () => {
  let service: GamificationService;
  let prisma: any;
  let natsClient: any;

  beforeEach(async () => {
    prisma = {
      userGamification: {
        findUnique: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
        findMany: jest.fn().mockResolvedValue([]),
        count: jest.fn().mockResolvedValue(0),
      },
      gamificationLog: { create: jest.fn() },
      gamificationHistory: { 
        create: jest.fn(), 
        aggregate: jest.fn().mockResolvedValue({ _sum: { amount: 0 } }) 
      },
      userAchievement: { count: jest.fn().mockResolvedValue(0) },
      user: { findUnique: jest.fn() },
      coupon: { create: jest.fn().mockResolvedValue({ id: 'c1' }) },
      streakLog: { upsert: jest.fn() },
      streak: { findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
      pointReward: { findUnique: jest.fn() },
      $transaction: jest.fn(async (cb) => cb(prisma)),
    };

    natsClient = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GamificationService,
        { provide: PrismaService, useValue: prisma },
        { provide: AchievementService, useValue: { checkAndAward: jest.fn() } },
        { provide: AuditLoggerService, useValue: { log: jest.fn() } },
        { provide: 'NATS_SERVICE', useValue: natsClient },
      ],
    }).compile();

    service = module.get<GamificationService>(GamificationService);
  });

  describe('trackActivity exhaustive', () => {
    it('should track activity successfully', async () => {
      prisma.userGamification.findUnique.mockResolvedValue({ 
        userId: 'u1', level: 1, currentXp: 90, totalPoints: 100 
      });
      prisma.userGamification.update.mockResolvedValue({ level: 2 });
      prisma.streak.findUnique.mockResolvedValue({ userId: 'u1', currentStreak: 1 });
      
      await service.trackActivity('u1', ActivityType.EXAM_COMPLETE, { examId: 'e1' });
      expect(prisma.gamificationLog.create).toHaveBeenCalled();
    });
  });

  describe('Rewards', () => {
    it('should redeem reward and deduct points', async () => {
      prisma.userGamification.findUnique.mockResolvedValue({ userId: 'u1', totalPoints: 1000 });
      prisma.pointReward.findUnique.mockResolvedValue({ 
        id: 'r1', pointsCost: 100, rewardType: 'COUPON', isActive: true,
        metadata: { prefix: 'TEST' } 
      });
      
      await service.redeemReward('u1', 'r1');
      expect(prisma.userGamification.update).toHaveBeenCalled();
    });
  });
});
