import { Test, TestingModule } from '@nestjs/testing';
import { ActivityService } from '../src/services/activity.service';
import { PrismaService } from '@server/shared';
import { StreakService } from '@server/gamification/services';
import { AchievementService } from '@server/gamification/services';
import { GamificationTransactionType } from '@prisma/generated';

describe('ActivityService', () => {
    let service: ActivityService;
    let prisma: any;
    let streakService: any;
    let achievementService: any;
    let natsClient: any;

    const mockUserId = 'user-123';

    beforeEach(async () => {
        const mockPrismaService = {
            dailyActivity: {
                findUnique: jest.fn(),
                create: jest.fn(),
                findMany: jest.fn(),
            },
            userGamification: {
                upsert: jest.fn(),
                update: jest.fn(),
                findUnique: jest.fn(),
            },
            gamificationHistory: {
                create: jest.fn(),
                findMany: jest.fn(),
                count: jest.fn(),
            },
        };

        const mockStreakService = {
            recordActivity: jest.fn(),
        };

        const mockAchievementService = {
            checkStreakAchievements: jest.fn(),
            checkLessonAchievements: jest.fn(),
            checkCourseAchievements: jest.fn(),
            checkQuizAchievements: jest.fn(),
            checkFlashcardAchievements: jest.fn(),
        };

        const mockNatsClient = {
            emit: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ActivityService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService as any,
                },
                {
                    provide: StreakService,
                    useValue: mockStreakService as any,
                },
                {
                    provide: AchievementService,
                    useValue: mockAchievementService as any,
                },
                {
                    provide: 'NATS_SERVICE',
                    useValue: mockNatsClient as any,
                },
            ],
        }).compile();

        service = module.get<ActivityService>(ActivityService);
        prisma = module.get(PrismaService);
        streakService = module.get(StreakService);
        achievementService = module.get(AchievementService);
        natsClient = module.get('NATS_SERVICE');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('recordActivity', () => {
        const activityType = 'LESSON_COMPLETE';

        beforeEach(() => {
            prisma.dailyActivity.findUnique.mockResolvedValue(null);
            prisma.userGamification.upsert.mockResolvedValue({ totalXp: 100, level: 1 });
            streakService.recordActivity.mockResolvedValue({
                streakUpdated: true,
                oldStreak: 1,
                newStreak: 2,
                isMilestone: false,
            });
        });

        it('should record new activity and update XP/Streak', async () => {
            const result = await service.recordActivity(mockUserId, activityType as any);

            expect(prisma.dailyActivity.create).toHaveBeenCalled();
            expect(prisma.userGamification.upsert).toHaveBeenCalled();
            expect(streakService.recordActivity).toHaveBeenCalledWith(mockUserId);
            expect(result.currentStreak).toBe(2);
        });

        it('should skip recording if activity already logged today but still update XP', async () => {
            prisma.dailyActivity.findUnique.mockResolvedValue({ id: 'exists' });

            await service.recordActivity(mockUserId, activityType as any);

            expect(prisma.dailyActivity.create).not.toHaveBeenCalled();
            expect(prisma.userGamification.upsert).toHaveBeenCalled();
        });

        it('should reward small XP for incorrect quiz answers', async () => {
            await service.recordActivity(mockUserId, 'QUIZ_ANSWER' as any, { isCorrect: false });

            expect(prisma.userGamification.upsert).toHaveBeenCalledWith(expect.objectContaining({
                create: expect.objectContaining({ totalXp: 2 }),
            }));
        });

        it('should check achievements based on activity type', async () => {
            // Test Lesson
            await service.recordActivity(mockUserId, 'LESSON_COMPLETE' as any);
            expect(achievementService.checkLessonAchievements).toHaveBeenCalledWith(mockUserId);

            // Test Quiz
            await service.recordActivity(mockUserId, 'QUIZ_ANSWER' as any, { score: 100, jlptLevel: 'N3' });
            expect(achievementService.checkQuizAchievements).toHaveBeenCalledWith(mockUserId, 100, 'N3');

            // Test Flashcard
            await service.recordActivity(mockUserId, 'FLASHCARD_REVIEW' as any);
            expect(achievementService.checkFlashcardAchievements).toHaveBeenCalledWith(mockUserId);
        });

        it('should check streak achievements only on milestones', async () => {
            streakService.recordActivity.mockResolvedValue({
                streakUpdated: true,
                newStreak: 3,
                isMilestone: true,
                oldStreak: 2,
            });

            await service.recordActivity(mockUserId, activityType as any);

            expect(achievementService.checkStreakAchievements).toHaveBeenCalledWith(mockUserId, 3);
        });

        it('should handle database error when checking existing activity', async () => {
            prisma.dailyActivity.findUnique.mockRejectedValue(new Error('DB Error'));
            await expect(service.recordActivity(mockUserId, activityType as any)).rejects.toThrow('DB Error');
        });

        it('should handle database error when creating activity', async () => {
            prisma.dailyActivity.findUnique.mockResolvedValue(null);
            prisma.dailyActivity.create.mockRejectedValue(new Error('Create Error'));
            await expect(service.recordActivity(mockUserId, activityType as any)).rejects.toThrow('Create Error');
        });

        it('should handle failure in streakService.recordActivity', async () => {
            streakService.recordActivity.mockRejectedValue(new Error('Streak Error'));
            await expect(service.recordActivity(mockUserId, activityType as any)).rejects.toThrow('Streak Error');
        });

        it('should not crash if updateXP fails internally', async () => {
            // updateXP is a private method called inside recordActivity, it has its own try-catch
            prisma.userGamification.upsert.mockRejectedValue(new Error('XP Update Error'));

            const result = await service.recordActivity(mockUserId, activityType as any);

            expect(result).toBeDefined();
            expect(result.currentStreak).toBe(2);
        });

        it('should handle failure in achievement services', async () => {
            achievementService.checkLessonAchievements.mockRejectedValue(new Error('Achievement Error'));

            await expect(service.recordActivity(mockUserId, 'LESSON_COMPLETE' as any)).rejects.toThrow('Achievement Error');
        });
    });

    describe('getWeeklyActiveDates', () => {
        it('should return unique active dates', async () => {
            const mockActivities = [{ date: '2024-01-01' }, { date: '2024-01-02' }];
            prisma.dailyActivity.findMany.mockResolvedValue(mockActivities);

            const result = await service.getWeeklyActiveDates(mockUserId);

            expect(result).toEqual(['2024-01-01', '2024-01-02']);
            expect(prisma.dailyActivity.findMany).toHaveBeenCalled();
        });

        it('should handle database error when fetching active dates', async () => {
            prisma.dailyActivity.findMany.mockRejectedValue(new Error('DB Error'));
            await expect(service.getWeeklyActiveDates(mockUserId)).rejects.toThrow('DB Error');
        });
    });

    describe('updateXP (internal logic test via level-up scenario)', () => {
        it('should level up user when XP threshold reached', async () => {
            // 400 XP reached (Level = sqrt(400/100) + 1 = 3)
            prisma.userGamification.upsert.mockResolvedValue({ totalXp: 400, level: 1 });
            streakService.recordActivity.mockResolvedValue({ streakUpdated: false, newStreak: 1, oldStreak: 1 });

            await service.recordActivity(mockUserId, 'EXAM_COMPLETE' as any);

            expect(prisma.userGamification.update).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ level: 3 })
            }));
            expect(natsClient.emit).toHaveBeenCalledWith('user.level_up', expect.objectContaining({
                level: 3
            }));
        });
    });

    describe('getHistory', () => {
        it('should return paginated history data', async () => {
            const mockData = [{ id: '1', amount: 50 }];
            prisma.gamificationHistory.findMany.mockResolvedValue(mockData);
            prisma.gamificationHistory.count.mockResolvedValue(1);

            const result = await service.getHistory(mockUserId, { page: '1', limit: '10' });

            expect(result.data).toEqual(mockData);
            expect(result.total).toBe(1);
            expect(result.totalPages).toBe(1);
        });

        it('should handle database error when fetching history', async () => {
            prisma.gamificationHistory.findMany.mockRejectedValue(new Error('History DB Error'));
            await expect(service.getHistory(mockUserId, {})).rejects.toThrow('History DB Error');
        });

        it('should handle invalid pagination parameters by using defaults', async () => {
            prisma.gamificationHistory.findMany.mockResolvedValue([]);
            prisma.gamificationHistory.count.mockResolvedValue(0);

            const result = await service.getHistory(mockUserId, { page: 'invalid', limit: '0' });

            expect(result.page).toBe(1);
            expect(result.limit).toBe(10);
        });
    });
});
