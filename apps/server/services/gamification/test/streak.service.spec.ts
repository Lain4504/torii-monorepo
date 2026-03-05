import { Test, TestingModule } from '@nestjs/testing';
import { StreakService } from '../src/services/streak.service';
import { PrismaService, REDIS_CLIENT } from '@server/shared';
import { ActivityService } from '@server/gamification/services';

describe('StreakService', () => {
  let service: StreakService;
  let prisma: any;
  let activityService: any;
  let redis: any;

  const mockUserId = 'user-123';

  beforeEach(async () => {
    const mockPrismaService = {
      userGamification: {
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        upsert: jest.fn(),
        findMany: jest.fn(),
      },
      userBalance: {
        findUnique: jest.fn(),
      },
    };

    const mockActivityService = {
      getWeeklyActiveDates: jest.fn(),
    };

    const mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StreakService,
        {
          provide: PrismaService,
          useValue: mockPrismaService as any,
        },
        {
          provide: ActivityService,
          useValue: mockActivityService as any,
        },
        {
          provide: REDIS_CLIENT,
          useValue: mockRedis as any,
        },
      ],
    }).compile();

    service = module.get<StreakService>(StreakService);
    prisma = module.get(PrismaService);
    activityService = module.get(ActivityService);
    redis = module.get(REDIS_CLIENT);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getGamificationProfile', () => {
    it('should return profile and handle missing balance', async () => {
      prisma.userGamification.findUnique.mockResolvedValue({
        id: '1',
        userId: mockUserId,
        level: 1,
        currentXp: 0,
        totalXp: 0,
        points: 100,
        gems: 10,
        currentStreak: 1,
        longestStreak: 1,
        lastActiveDate: '2024-01-01',
        freezeCount: 0,
        totalActiveDays: 1,
        weeklyActiveCount: 1,
        monthlyActiveCount: 1,
        updatedAt: new Date(),
      });
      prisma.userBalance.findUnique.mockResolvedValue(null);

      const result = await service.getGamificationProfile(mockUserId);
      expect(result.balance).toBe(0);
    });

    it('should throw error if database query fails', async () => {
      prisma.userGamification.findUnique.mockRejectedValue(
        new Error('DB Connection Failed'),
      );
      await expect(service.getGamificationProfile(mockUserId)).rejects.toThrow(
        'DB Connection Failed',
      );
    });
  });

  describe('getStreakStatus', () => {
    it('should return streak status and check for toast', async () => {
      const today = new Date().toISOString().split('T')[0];
      const mockGamification = {
        currentStreak: 5,
        longestStreak: 10,
        freezeCount: 2,
        lastActiveDate: today,
        totalActiveDays: 20,
        weeklyActiveCount: 3,
        monthlyActiveCount: 15,
      };

      prisma.userGamification.findUnique.mockResolvedValue(mockGamification);
      redis.get.mockResolvedValue(null); // Toast not shown yet
      activityService.getWeeklyActiveDates.mockResolvedValue([today]);

      const result = await service.getStreakStatus(mockUserId);

      expect(result.currentStreak).toBe(5);
      expect(result.isActiveToday).toBe(true);
      expect(result.shouldShowToast).toBe(true);
      expect(redis.get).toHaveBeenCalledWith(
        `streak_toast:${mockUserId}:${today}`,
      );
    });

    it('should initialize gamification if not exists', async () => {
      prisma.userGamification.findUnique.mockResolvedValue(null);
      prisma.userGamification.create.mockResolvedValue({
        currentStreak: 0,
        lastActiveDate: null,
      });
      activityService.getWeeklyActiveDates.mockResolvedValue([]);

      await service.getStreakStatus(mockUserId);

      expect(prisma.userGamification.create).toHaveBeenCalledWith({
        data: { userId: mockUserId },
      });
    });

    it('should throw error if Redis fails when checking toast', async () => {
      prisma.userGamification.findUnique.mockResolvedValue({
        currentStreak: 1,
      });
      redis.get.mockRejectedValue(new Error('Redis Down'));
      activityService.getWeeklyActiveDates.mockResolvedValue([]);

      await expect(service.getStreakStatus(mockUserId)).rejects.toThrow(
        'Redis Down',
      );
    });

    it('should throw error if ActivityService fails', async () => {
      prisma.userGamification.findUnique.mockResolvedValue({
        currentStreak: 1,
      });
      redis.get.mockResolvedValue(null);
      activityService.getWeeklyActiveDates.mockRejectedValue(
        new Error('Activity Service Error'),
      );

      await expect(service.getStreakStatus(mockUserId)).rejects.toThrow(
        'Activity Service Error',
      );
    });
  });

  describe('recordActivity', () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split('T')[0];

    it('should start streak at 1 for first-time activity', async () => {
      prisma.userGamification.findUnique.mockResolvedValue({
        lastActiveDate: null,
        currentStreak: 0,
        longestStreak: 0,
        freezeCount: 0,
      });

      const result = await service.recordActivity(mockUserId);

      expect(result.newStreak).toBe(1);
      expect(prisma.userGamification.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ currentStreak: 1 }),
        }),
      );
    });

    it('should increment streak if active today after yesterday', async () => {
      prisma.userGamification.findUnique.mockResolvedValue({
        lastActiveDate: yesterday,
        currentStreak: 5,
        longestStreak: 5,
        freezeCount: 0,
      });

      const result = await service.recordActivity(mockUserId);

      expect(result.newStreak).toBe(6);
      expect(result.streakUpdated).toBe(true);
    });

    it('should detect milestones', async () => {
      prisma.userGamification.findUnique.mockResolvedValue({
        lastActiveDate: yesterday,
        currentStreak: 6, // will become 7
        longestStreak: 6,
        freezeCount: 0,
      });

      const result = await service.recordActivity(mockUserId);

      expect(result.newStreak).toBe(7);
      expect(result.isMilestone).toBe(true);
    });

    it('should use freeze if day missed (2-day gap)', async () => {
      const twoDaysAgo = new Date(Date.now() - 86400000 * 2)
        .toISOString()
        .split('T')[0];
      prisma.userGamification.findUnique.mockResolvedValue({
        lastActiveDate: twoDaysAgo,
        currentStreak: 10,
        longestStreak: 10,
        freezeCount: 1,
      });

      const result = await service.recordActivity(mockUserId);

      expect(result.newStreak).toBe(11);
      expect(prisma.userGamification.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ freezeCount: 0 }),
        }),
      );
    });

    it('should reset streak if day missed and no freeze', async () => {
      const twoDaysAgo = new Date(Date.now() - 86400000 * 2)
        .toISOString()
        .split('T')[0];
      prisma.userGamification.findUnique.mockResolvedValue({
        lastActiveDate: twoDaysAgo,
        currentStreak: 10,
        longestStreak: 10,
        freezeCount: 0,
      });

      const result = await service.recordActivity(mockUserId);

      expect(result.newStreak).toBe(1);
    });

    it('should reset streak if missed 3 or more days even if having freeze', async () => {
      const threeDaysAgo = new Date(Date.now() - 86400000 * 3)
        .toISOString()
        .split('T')[0];
      prisma.userGamification.findUnique.mockResolvedValue({
        lastActiveDate: threeDaysAgo,
        currentStreak: 10,
        longestStreak: 10,
        freezeCount: 5,
      });

      const result = await service.recordActivity(mockUserId);

      expect(result.newStreak).toBe(1);
      expect(prisma.userGamification.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ freezeCount: 5 }), // Freeze not used
        }),
      );
    });

    it('should throw error if update operation fails', async () => {
      prisma.userGamification.findUnique.mockResolvedValue({
        lastActiveDate: yesterday,
        currentStreak: 5,
      });
      prisma.userGamification.update.mockRejectedValue(
        new Error('Update Failed'),
      );

      await expect(service.recordActivity(mockUserId)).rejects.toThrow(
        'Update Failed',
      );
    });
  });

  describe('checkStreaksDaily', () => {
    it('should auto-use freeze for at-risk users', async () => {
      const yesterday = new Date(Date.now() - 86400000)
        .toISOString()
        .split('T')[0];
      const twoDaysAgo = new Date(Date.now() - 86400000 * 2)
        .toISOString()
        .split('T')[0];

      const atRiskUser = {
        id: 'gam-1',
        userId: mockUserId,
        lastActiveDate: twoDaysAgo,
        currentStreak: 5,
        freezeCount: 1,
      };

      prisma.userGamification.findMany.mockResolvedValue([atRiskUser]);

      await service.checkStreaksDaily();

      expect(prisma.userGamification.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'gam-1' },
          data: { freezeCount: { decrement: 1 } },
        }),
      );
    });

    it('should reset streak for at-risk users with no freeze', async () => {
      const users = [
        {
          id: 'gam-2',
          userId: 'other-user',
          lastActiveDate: '2024-01-01',
          currentStreak: 5,
          freezeCount: 0,
        },
      ];

      prisma.userGamification.findMany.mockResolvedValue(users);

      await service.checkStreaksDaily();

      expect(prisma.userGamification.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'gam-2' },
          data: { currentStreak: 0 },
        }),
      );
    });

    it('should handle database error while fetching users', async () => {
      prisma.userGamification.findMany.mockRejectedValue(
        new Error('Fetch Error'),
      );
      await expect(service.checkStreaksDaily()).rejects.toThrow('Fetch Error');
    });

    it('should handle database error during individual user update', async () => {
      prisma.userGamification.findMany.mockResolvedValue([
        { id: 'g1', userId: 'u1', freezeCount: 0 },
      ]);
      prisma.userGamification.update.mockRejectedValue(
        new Error('Internal Update Error'),
      );

      await expect(service.checkStreaksDaily()).rejects.toThrow(
        'Internal Update Error',
      );
    });
  });
});
