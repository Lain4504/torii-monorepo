import { Test, TestingModule } from '@nestjs/testing';
import { AchievementService } from '../src/modules/gamification/achievement.service';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { AuditLoggerService } from '../src/modules/audit-logger.service';

describe('AchievementService', () => {
  let service: AchievementService;
  let prisma: any;
  let natsClient: any;

  beforeEach(async () => {
    const mockPrisma = {
      achievement: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      userAchievement: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        upsert: jest.fn(),
        count: jest.fn(),
      },
      streak: { findUnique: jest.fn() },
      streakLog: { count: jest.fn() },
      userLessonProgress: { count: jest.fn() },
      courseReview: { count: jest.fn() },
      gamificationHistory: { aggregate: jest.fn(), create: jest.fn() },
      enrollment: { count: jest.fn() },
      userGamification: { findUnique: jest.fn(), update: jest.fn() },
      $transaction: jest.fn(async (cb) => cb(mockPrisma)),
    };

    const mockAudit = { log: jest.fn() };
    const mockNats = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AchievementService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AuditLoggerService, useValue: mockAudit },
        { provide: 'NATS_SERVICE', useValue: mockNats },
      ],
    }).compile();

    service = module.get<AchievementService>(AchievementService);
    prisma = module.get<PrismaService>(PrismaService);
    natsClient = module.get('NATS_SERVICE');
  });

  describe('getAchievementsForUser', () => {
    it('should return all active achievements with progress', async () => {
      prisma.achievement.findMany.mockResolvedValueOnce([
        { id: 'a1', title: 'A1', requirements: { value: 10 }, isActive: true },
      ]);
      prisma.userAchievement.findMany.mockResolvedValueOnce([
        { achievementId: 'a1', isUnlocked: true, progress: { current: 10, target: 10 } },
      ]);

      const result = await service.getAchievementsForUser('u1');
      expect(result.length).toBe(1);
      expect(result[0].isUnlocked).toBe(true);
    });

    it('should return virtual progress if no user record exists', async () => {
      prisma.achievement.findMany.mockResolvedValueOnce([
        { id: 'a1', title: 'A1', requirements: { value: 5 }, isActive: true },
      ]);
      prisma.userAchievement.findMany.mockResolvedValueOnce([]);

      const result = await service.getAchievementsForUser('u1');
      expect(result[0].isUnlocked).toBe(false);
      expect(result[0].progress.target).toBe(5);
    });
  });

  describe('evaluateForUser', () => {
    it('should unlock achievement if target reached', async () => {
      prisma.achievement.findMany.mockResolvedValueOnce([
        { id: 'a1', code: 'S1', requirements: { type: 'LESSONS_COMPLETED', value: 5 }, rewards: { points: 100 } },
      ]);
      prisma.userAchievement.findMany.mockResolvedValueOnce([]);
      prisma.userLessonProgress.count.mockResolvedValueOnce(5);

      // unlockAchievement details
      prisma.achievement.findUnique.mockResolvedValueOnce({ id: 'a1', title: 'A1', rewards: { points: 100 } });
      prisma.userAchievement.findUnique.mockResolvedValueOnce(null); // Not already unlocked in tx

      await service.evaluateForUser('u1');

      expect(prisma.userAchievement.upsert).toHaveBeenCalledWith(
        expect.objectContaining({ update: expect.objectContaining({ isUnlocked: true }) })
      );
      expect(prisma.userGamification.update).toHaveBeenCalled();
      expect(natsClient.emit).toHaveBeenCalled();
    });
  });
});
