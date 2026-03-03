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

        it('should throw error if ensureAchievementsExist fails', async () => {
            prisma.achievement.upsert.mockRejectedValue(new Error('Upsert Failed'));
            await expect(service.getUserAchievements(mockUserId)).rejects.toThrow('Upsert Failed');
        });

        it('should handle failure in findMany achievements', async () => {
            prisma.achievement.upsert.mockResolvedValue({});
            prisma.achievement.findMany.mockRejectedValue(new Error('Fetch Error'));
            await expect(service.getUserAchievements(mockUserId)).rejects.toThrow('Fetch Error');
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

        it('should handle database error when counting lessons', async () => {
            prisma.lessonProgress.count.mockRejectedValue(new Error('Count Error'));
            await expect(service.checkLessonAchievements(mockUserId)).rejects.toThrow('Count Error');
        });
    });

    describe('checkCourseAchievements', () => {
        it('should unlock course achievements based on count', async () => {
            prisma.enrollment.count.mockResolvedValue(1);
            const unlockSpy = jest.spyOn(service as any, 'unlockAchievement').mockResolvedValue(undefined);

            await service.checkCourseAchievements(mockUserId);

            expect(prisma.enrollment.count).toHaveBeenCalled();
            expect(unlockSpy).toHaveBeenCalledWith(mockUserId, 'FIRST_COURSE');
        });

        it('should handle database error when counting courses', async () => {
            prisma.enrollment.count.mockRejectedValue(new Error('Course DB Error'));
            await expect(service.checkCourseAchievements(mockUserId)).rejects.toThrow('Course DB Error');
        });
    });

    describe('checkFlashcardAchievements', () => {
        it('should unlock flashcard achievements based on count', async () => {
            prisma.flashcardReview.count.mockResolvedValue(100);
            const unlockSpy = jest.spyOn(service as any, 'unlockAchievement').mockResolvedValue(undefined);

            await service.checkFlashcardAchievements(mockUserId);

            expect(prisma.flashcardReview.count).toHaveBeenCalled();
            expect(unlockSpy).toHaveBeenCalledWith(mockUserId, 'FLASHCARD_100');
        });

        it('should handle database error when counting reviews', async () => {
            prisma.flashcardReview.count.mockRejectedValue(new Error('Flashcard DB Error'));
            await expect(service.checkFlashcardAchievements(mockUserId)).rejects.toThrow('Flashcard DB Error');
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

        it('should return early if achievement findUnique returns null', async () => {
            prisma.achievement.upsert.mockResolvedValue({});
            prisma.achievement.findUnique.mockResolvedValue(null);

            await service.unlockAchievement(mockUserId, 'INVALID_CODE');

            expect(prisma.userAchievement.findUnique).not.toHaveBeenCalled();
        });

        it('should handle database error while checking existing unlock', async () => {
            const mockAchievement = { id: 'ach-1', code: 'STREAK_3', isActive: true };
            prisma.achievement.upsert.mockResolvedValue({});
            prisma.achievement.findUnique.mockResolvedValue(mockAchievement);
            prisma.userAchievement.findUnique.mockRejectedValue(new Error('Selection Error'));

            await expect(service.unlockAchievement(mockUserId, 'STREAK_3')).rejects.toThrow('Selection Error');
        });

        it('should handle error during userAchievement upsert', async () => {
            const mockAchievement = { id: 'ach-1', code: 'STREAK_3', isActive: true, rewards: {} };
            prisma.achievement.upsert.mockResolvedValue({});
            prisma.achievement.findUnique.mockResolvedValue(mockAchievement);
            prisma.userAchievement.findUnique.mockResolvedValue(null);
            prisma.userAchievement.upsert.mockRejectedValue(new Error('Update Error'));

            await expect(service.unlockAchievement(mockUserId, 'STREAK_3')).rejects.toThrow('Update Error');
        });

        it('should propagate natsClient emit failure', async () => {
            const mockAchievement = { id: 'ach-1', code: 'STREAK_3', isActive: true, title: 'T', rewards: {} };
            prisma.achievement.upsert.mockResolvedValue({});
            prisma.achievement.findUnique.mockResolvedValue(mockAchievement);
            prisma.userAchievement.findUnique.mockResolvedValue(null);
            prisma.userAchievement.upsert.mockResolvedValue({});
            natsClient.emit.mockImplementation(() => { throw new Error('NATS Fail'); });

            await expect(service.unlockAchievement(mockUserId, 'STREAK_3')).rejects.toThrow('NATS Fail');
        });

        it('should handle failure in applying rewards (gamification upsert)', async () => {
            const mockAchievement = {
                id: 'ach-1', code: 'STREAK_3', isActive: true, title: 'T',
                rewards: { freezeCount: 1 }
            };
            prisma.achievement.upsert.mockResolvedValue({});
            prisma.achievement.findUnique.mockResolvedValue(mockAchievement);
            prisma.userAchievement.findUnique.mockResolvedValue(null);
            prisma.userAchievement.upsert.mockResolvedValue({});
            prisma.userGamification.upsert.mockRejectedValue(new Error('Rewards Error'));

            await expect(service.unlockAchievement(mockUserId, 'STREAK_3')).rejects.toThrow('Rewards Error');
        });
    });
});
