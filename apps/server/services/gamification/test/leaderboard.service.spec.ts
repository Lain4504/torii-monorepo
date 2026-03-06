import { Test, TestingModule } from '@nestjs/testing';
import { LeaderboardService } from '../src/services/leaderboard.service';
import { PrismaService } from '@server/shared';

describe('LeaderboardService', () => {
  let service: LeaderboardService;
  let prisma: any;

  const mockUserId = 'user-123';
  const mockUser = {
    id: mockUserId,
    displayName: 'Test User',
    avatarUrl: 'avatar.png',
    createdAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      userGamification: {
        upsert: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
      },
      user: {
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeaderboardService,
        {
          provide: PrismaService,
          useValue: mockPrismaService as any,
        },
      ],
    }).compile();

    service = module.get<LeaderboardService>(LeaderboardService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getGlobalLeaderboard', () => {
    it('should return top 100 users and current user rank', async () => {
      const mockTopGamification = [
        {
          totalXp: 1000,
          level: 10,
          currentStreak: 5,
          user: { ...mockUser, id: 'user-1' },
        },
        {
          totalXp: 500,
          level: 5,
          currentStreak: 2,
          user: { ...mockUser, id: 'user-2' },
        },
      ];

      prisma.userGamification.findMany.mockResolvedValue(mockTopGamification);
      prisma.user.count.mockResolvedValue(100);
      prisma.userGamification.upsert.mockResolvedValue({});

      const result = await service.getGlobalLeaderboard(mockUserId);

      expect(result.users).toHaveLength(2);
      expect(result.totalUsers).toBe(100);
      expect(result.type).toBe('global');
      expect(prisma.userGamification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
          orderBy: expect.arrayContaining([{ totalXp: 'desc' }]),
        }),
      );
    });

    it('should fetch current user rank if not in top 100', async () => {
      const mockTopGamification = [
        {
          totalXp: 1000,
          level: 10,
          currentStreak: 5,
          user: { ...mockUser, id: 'other-user' },
        },
      ];
      const mockUserGamification = {
        totalXp: 100,
        level: 2,
        currentStreak: 0,
        user: mockUser,
      };

      prisma.userGamification.findMany.mockResolvedValue(mockTopGamification);
      prisma.userGamification.findUnique.mockResolvedValue(
        mockUserGamification,
      );
      prisma.userGamification.count.mockResolvedValueOnce(50); // betterScoreCount
      prisma.userGamification.count.mockResolvedValueOnce(5); // sameScoreBetterTimeCount
      prisma.user.count.mockResolvedValue(200);

      const result = await service.getGlobalLeaderboard(mockUserId);

      expect(result.currentUser?.id).toBe(mockUserId);
      expect(result.currentUser?.rank).toBe(56); // 50 + 5 + 1
    });

    it('should throw error if findMany fails', async () => {
      prisma.userGamification.findMany.mockRejectedValue(
        new Error('Fetch Error'),
      );
      await expect(service.getGlobalLeaderboard()).rejects.toThrow(
        'Fetch Error',
      );
    });

    it('should handle database error in count methods', async () => {
      prisma.userGamification.findMany.mockResolvedValue([]);
      prisma.user.count.mockRejectedValue(new Error('Count Error'));
      await expect(service.getGlobalLeaderboard()).rejects.toThrow(
        'Count Error',
      );
    });

    it('should continue if ensureUserGamification fails (private call)', async () => {
      prisma.userGamification.upsert.mockRejectedValue(
        new Error('Upsert Failed'),
      );
      prisma.userGamification.findMany.mockResolvedValue([]);
      prisma.user.count.mockResolvedValue(0);

      const result = await service.getGlobalLeaderboard(mockUserId);
      expect(result.users).toEqual([]);
      // Service should not throw as ensureUserGamification has a try-catch
    });

    it('should return undefined currentUser if user findUnique fails', async () => {
      prisma.userGamification.findMany.mockResolvedValue([]);
      prisma.userGamification.findUnique.mockResolvedValue(null);
      prisma.user.count.mockResolvedValue(10);

      const result = await service.getGlobalLeaderboard(mockUserId);
      expect(result.currentUser).toBeUndefined();
    });
  });

  describe('getStreakLeaderboard', () => {
    it('should return top users by streak', async () => {
      const mockTopStreaks = [
        {
          totalXp: 1000,
          level: 10,
          currentStreak: 50,
          user: { ...mockUser, id: 'user-1' },
        },
      ];

      prisma.userGamification.findMany.mockResolvedValue(mockTopStreaks);
      prisma.user.count.mockResolvedValue(50);

      const result = await service.getStreakLeaderboard();

      expect(result.users[0].currentStreak).toBe(50);
      expect(result.type).toBe('streak');
      expect(prisma.userGamification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: expect.arrayContaining([{ currentStreak: 'desc' }]),
        }),
      );
    });

    it('should throw error if findMany fails for streaks', async () => {
      prisma.userGamification.findMany.mockRejectedValue(
        new Error('Streak Fetch Error'),
      );
      await expect(service.getStreakLeaderboard()).rejects.toThrow(
        'Streak Fetch Error',
      );
    });

    it('should handle error when fetching individual streak rank', async () => {
      prisma.userGamification.findMany.mockResolvedValue([]);
      prisma.userGamification.findUnique.mockRejectedValue(
        new Error('Rank Fetch Error'),
      );

      await expect(service.getStreakLeaderboard(mockUserId)).rejects.toThrow(
        'Rank Fetch Error',
      );
    });
  });
});
