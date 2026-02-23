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
            expect(prisma.userGamification.findMany).toHaveBeenCalledWith(expect.objectContaining({
                take: 100,
                orderBy: expect.arrayContaining([{ totalXp: 'desc' }]),
            }));
        });

        it('should fetch current user rank if not in top 100', async () => {
            const mockTopGamification = [
                { totalXp: 1000, level: 10, currentStreak: 5, user: { ...mockUser, id: 'other-user' } }
            ];
            const mockUserGamification = {
                totalXp: 100,
                level: 2,
                currentStreak: 0,
                user: mockUser,
            };

            prisma.userGamification.findMany.mockResolvedValue(mockTopGamification);
            prisma.userGamification.findUnique.mockResolvedValue(mockUserGamification);
            prisma.userGamification.count.mockResolvedValueOnce(50); // betterScoreCount
            prisma.userGamification.count.mockResolvedValueOnce(5);  // sameScoreBetterTimeCount
            prisma.user.count.mockResolvedValue(200);

            const result = await service.getGlobalLeaderboard(mockUserId);

            expect(result.currentUser?.id).toBe(mockUserId);
            expect(result.currentUser?.rank).toBe(56); // 50 + 5 + 1
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
            expect(prisma.userGamification.findMany).toHaveBeenCalledWith(expect.objectContaining({
                orderBy: expect.arrayContaining([{ currentStreak: 'desc' }]),
            }));
        });
    });
});
