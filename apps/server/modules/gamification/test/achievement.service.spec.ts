import { Test, TestingModule } from '@nestjs/testing';
import { AchievementService } from '../src/services/achievement.service';
import { PrismaService } from '@server/shared';
import { Logger } from '@nestjs/common';

describe('AchievementService', () => {
    let service: AchievementService;
    let prisma: any;
    let natsClient: any;

    const mockUserId = 'user-123';

    beforeEach(async () => {
        const mockPrismaService = {
            achievement: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
                upsert: jest.fn(),
            },
            userAchievement: {
                findMany: jest.fn(),
                findUnique: jest.fn(),
                upsert: jest.fn(),
            },
            lessonProgress: {
                count: jest.fn(),
            },
            enrollment: {
                count: jest.fn(),
            },
            flashcardReview: {
                count: jest.fn(),
            },
            userGamification: {
                upsert: jest.fn(),
            },
        };

        const mockNatsClient = {
            emit: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AchievementService,
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

        service = module.get<AchievementService>(AchievementService);
        prisma = module.get(PrismaService);
        natsClient = module.get('NATS_SERVICE');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getUserAchievements', () => {
        it('should return achievements with unlock status', async () => {
            const mockAchievements = [
                { id: 'ach-1', code: 'STREAK_3', title: 'Ach 1', isActive: true, requirements: {}, rewards: {}, orderIndex: 1 },
                { id: 'ach-2', code: 'STREAK_7', title: 'Ach 2', isActive: true, requirements: {}, rewards: {}, orderIndex: 2 },
            ];
            const mockUserAchievements = [
                { achievementId: 'ach-1', isUnlocked: true, progress: {}, unlockedAt: new Date() },
            ];

            prisma.achievement.findMany.mockResolvedValue(mockAchievements);
            prisma.userAchievement.findMany.mockResolvedValue(mockUserAchievements);
            prisma.achievement.upsert.mockResolvedValue({}); // for ensureAchievementsExist

            const result = await service.getUserAchievements(mockUserId);

            expect(result).toHaveLength(2);
            expect(result[0].isUnlocked).toBe(true);
            expect(result[1].isUnlocked).toBe(false);
            expect(prisma.achievement.findMany).toHaveBeenCalled();
        });
    });

    describe('checkStreakAchievements', () => {
        it('should unlock streak achievements if milestone reached', async () => {
            const unlockSpy = jest.spyOn(service as any, 'unlockAchievement').mockResolvedValue(undefined);

            await service.checkStreakAchievements(mockUserId, 7);

            // STREAK_3 and STREAK_7 should be checked
            expect(unlockSpy).toHaveBeenCalledWith(mockUserId, 'STREAK_3');
            expect(unlockSpy).toHaveBeenCalledWith(mockUserId, 'STREAK_7');
            expect(unlockSpy).not.toHaveBeenCalledWith(mockUserId, 'STREAK_14');
        });
    });

    describe('checkLessonAchievements', () => {
        it('should unlock lesson achievements based on count', async () => {
            prisma.lessonProgress.count.mockResolvedValue(1);
            const unlockSpy = jest.spyOn(service as any, 'unlockAchievement').mockResolvedValue(undefined);

            await service.checkLessonAchievements(mockUserId);

            expect(prisma.lessonProgress.count).toHaveBeenCalled();
            expect(unlockSpy).toHaveBeenCalledWith(mockUserId, 'FIRST_LESSON');
        });
    });

    describe('checkQuizAchievements', () => {
        it('should unlock perfect quiz achievement if score is 100', async () => {
            const unlockSpy = jest.spyOn(service as any, 'unlockAchievement').mockResolvedValue(undefined);

            await service.checkQuizAchievements(mockUserId, 100, 'N3');

            expect(unlockSpy).toHaveBeenCalledWith(mockUserId, 'QUIZ_PERFECT_N3');
        });

        it('should not unlock if score < 100', async () => {
            const unlockSpy = jest.spyOn(service as any, 'unlockAchievement').mockResolvedValue(undefined);

            await service.checkQuizAchievements(mockUserId, 99, 'N3');

            expect(unlockSpy).not.toHaveBeenCalled();
        });
    });

    describe('unlockAchievement', () => {
        it('should unlock achievement and emit event if not already unlocked', async () => {
            const mockAchievement = {
                id: 'ach-id',
                code: 'STREAK_3',
                title: 'Title',
                isActive: true,
                rewards: { freezeCount: 1 }
            };

            prisma.achievement.findUnique.mockResolvedValue(mockAchievement);
            prisma.userAchievement.findUnique.mockResolvedValue(null); // Not unlocked yet
            prisma.userAchievement.upsert.mockResolvedValue({});
            prisma.userGamification.upsert.mockResolvedValue({});

            await service.unlockAchievement(mockUserId, 'STREAK_3');

            expect(prisma.userAchievement.upsert).toHaveBeenCalled();
            expect(prisma.userGamification.upsert).toHaveBeenCalledWith(expect.objectContaining({
                update: { freezeCount: { increment: 1 } }
            }));
            expect(natsClient.emit).toHaveBeenCalledWith('achievement.unlocked', expect.objectContaining({
                achievementCode: 'STREAK_3'
            }));
        });

        it('should do nothing if already unlocked', async () => {
            const mockAchievement = { id: 'ach-id', code: 'STREAK_3', isActive: true };

            prisma.achievement.findUnique.mockResolvedValue(mockAchievement);
            prisma.userAchievement.findUnique.mockResolvedValue({ isUnlocked: true });

            await service.unlockAchievement(mockUserId, 'STREAK_3');

            expect(prisma.userAchievement.upsert).not.toHaveBeenCalled();
            expect(natsClient.emit).not.toHaveBeenCalled();
        });
    });
});
