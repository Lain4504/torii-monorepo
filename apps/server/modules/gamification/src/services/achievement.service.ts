import { Injectable, Logger, Inject } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { ClientProxy } from '@nestjs/microservices';
import {
    UserAchievementDto,
    AchievementUnlockedEvent,
} from '@workspace/schemas';

// Hardcoded achievement definitions
const ACHIEVEMENT_DEFINITIONS = [
    // STREAK
    { code: 'STREAK_3', category: 'STREAK', title: 'Người mới bắt đầu', description: 'Học liên tục 3 ngày', icon: 'Flame', requirements: { streakDays: 3 }, rewards: { freezeCount: 1 }, orderIndex: 1 },
    { code: 'STREAK_7', category: 'STREAK', title: 'Tuần hoàn hảo', description: 'Học liên tục 7 ngày', icon: 'Calendar', requirements: { streakDays: 7 }, rewards: { freezeCount: 2 }, orderIndex: 2 },
    { code: 'STREAK_14', category: 'STREAK', title: 'Hai tuần quyết tâm', description: 'Học liên tục 14 ngày', icon: 'TrendingUp', requirements: { streakDays: 14 }, rewards: { freezeCount: 3 }, orderIndex: 3 },
    { code: 'STREAK_30', category: 'STREAK', title: 'Tháng thành công', description: 'Học liên tục 30 ngày', icon: 'Trophy', requirements: { streakDays: 30 }, rewards: { freezeCount: 5 }, orderIndex: 4 },
    { code: 'STREAK_100', category: 'STREAK', title: 'Bậc thầy kiên trì', description: 'Học liên tục 100 ngày', icon: 'Star', requirements: { streakDays: 100 }, rewards: { freezeCount: 10 }, orderIndex: 5 },

    // LEARNING_PROGRESS
    { code: 'FIRST_LESSON', category: 'LEARNING_PROGRESS', title: 'Bài học đầu tiên', description: 'Hoàn thành bài học đầu tiên', icon: 'BookOpen', requirements: { lessonsCompleted: 1 }, rewards: {}, orderIndex: 6 },
    { code: 'LESSON_50', category: 'LEARNING_PROGRESS', title: 'Người học tích cực', description: 'Hoàn thành 50 bài học', icon: 'Target', requirements: { lessonsCompleted: 50 }, rewards: { freezeCount: 1 }, orderIndex: 7 },
    { code: 'FIRST_COURSE', category: 'LEARNING_PROGRESS', title: 'Bước đầu tiên', description: 'Hoàn thành khóa học đầu tiên', icon: 'GraduationCap', requirements: { coursesCompleted: 1 }, rewards: {}, orderIndex: 8 },
    { code: 'COURSE_5', category: 'LEARNING_PROGRESS', title: 'Người học chăm chỉ', description: 'Hoàn thành 5 khóa học', icon: 'Award', requirements: { coursesCompleted: 5 }, rewards: { freezeCount: 2 }, orderIndex: 9 },

    // MASTERY
    { code: 'QUIZ_PERFECT_N5', category: 'MASTERY', title: 'Thành thạo N5', description: 'Đạt 100% trong bài kiểm tra N5', icon: 'Zap', requirements: { quizScore: 100, jlptLevel: 'N5' }, rewards: {}, orderIndex: 10 },
    { code: 'QUIZ_PERFECT_N4', category: 'MASTERY', title: 'Thành thạo N4', description: 'Đạt 100% trong bài kiểm tra N4', icon: 'Zap', requirements: { quizScore: 100, jlptLevel: 'N4' }, rewards: { freezeCount: 1 }, orderIndex: 11 },
    { code: 'QUIZ_PERFECT_N3', category: 'MASTERY', title: 'Thành thạo N3', description: 'Đạt 100% trong bài kiểm tra N3', icon: 'Zap', requirements: { quizScore: 100, jlptLevel: 'N3' }, rewards: { freezeCount: 2 }, orderIndex: 12 },
    { code: 'QUIZ_PERFECT_N2', category: 'MASTERY', title: 'Thành thạo N2', description: 'Đạt 100% trong bài kiểm tra N2', icon: 'Zap', requirements: { quizScore: 100, jlptLevel: 'N2' }, rewards: { freezeCount: 3 }, orderIndex: 13 },
    { code: 'QUIZ_PERFECT_N1', category: 'MASTERY', title: 'Thành thạo N1', description: 'Đạt 100% trong bài kiểm tra N1', icon: 'Zap', requirements: { quizScore: 100, jlptLevel: 'N1' }, rewards: { freezeCount: 5 }, orderIndex: 14 },
    { code: 'FLASHCARD_100', category: 'MASTERY', title: 'Người ghi nhớ', description: 'Ôn tập 100 flashcard', icon: 'Heart', requirements: { flashcardsReviewed: 100 }, rewards: {}, orderIndex: 15 },
    { code: 'FLASHCARD_1000', category: 'MASTERY', title: 'Bậc thầy ghi nhớ', description: 'Ôn tập 1000 flashcard', icon: 'Star', requirements: { flashcardsReviewed: 1000 }, rewards: { freezeCount: 5 }, orderIndex: 16 },

    // QUIZ & EXAM
    { code: 'FIRST_EXAM', category: 'LEARNING_PROGRESS', title: 'Thử thách đầu tiên', description: 'Hoàn thành bài kiểm tra đầu tiên', icon: 'FileText', requirements: { examsCompleted: 1 }, rewards: {}, orderIndex: 17 },
    { code: 'EXAM_MASTER', category: 'LEARNING_PROGRESS', title: 'Bậc thầy phòng thi', description: 'Hoàn thành 10 bài kiểm tra', icon: 'Award', requirements: { examsCompleted: 10 }, rewards: { freezeCount: 2 }, orderIndex: 18 },
    { code: 'QUIZ_WARRIOR', category: 'LEARNING_PROGRESS', title: 'Chiến binh Quiz', description: 'Hoàn thành 50 bài trắc nghiệm nhanh', icon: 'Zap', requirements: { quizzesCompleted: 50 }, rewards: { freezeCount: 3 }, orderIndex: 19 },
    { code: 'PERFECT_SCORE', category: 'MASTERY', title: 'Điểm tuyệt đối', description: 'Đạt điểm tối đa trong một bài kiểm tra bất kỳ', icon: 'Target', requirements: { quizScore: 100 }, rewards: { freezeCount: 1 }, orderIndex: 20 },

    // CONSISTENCY
    { code: 'WEEKLY_WARRIOR', category: 'CONSISTENCY', title: 'Chiến binh tuần lễ', description: 'Học ít nhất 5 ngày/tuần trong 4 tuần', icon: 'Calendar', requirements: { weeksWithFiveDays: 4 }, rewards: { freezeCount: 3 }, orderIndex: 21 },
];

@Injectable()
export class AchievementService {
    private readonly logger = new Logger(AchievementService.name);

    constructor(
        private readonly prisma: PrismaService,
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    /**
     * Get all achievements with user progress (lazy initialization)
     */
    async getUserAchievements(userId: string): Promise<UserAchievementDto[]> {
        // Ensure all hardcoded achievements exist in DB
        await this.ensureAchievementsExist();

        // Get all active achievements
        const allAchievements = await this.prisma.achievement.findMany({
            where: { isActive: true },
            orderBy: { orderIndex: 'asc' },
        });

        // Get user's unlocked achievements
        const userAchievements = await this.prisma.userAchievement.findMany({
            where: { userId },
        });

        const userAchMap = new Map(
            userAchievements.map(ua => [ua.achievementId, ua])
        );

        // Return all achievements with unlock status
        return allAchievements.map(ach => {
            const userAch = userAchMap.get(ach.id);
            return {
                id: userAch?.id || `temp-${ach.id}`,
                achievementId: ach.id,
                isUnlocked: userAch?.isUnlocked || false,
                progress: userAch?.progress as Record<string, any> | null,
                unlockedAt: userAch?.unlockedAt?.toISOString() || null,
                achievement: {
                    id: ach.id,
                    code: ach.code,
                    category: ach.category as any,
                    title: ach.title,
                    description: ach.description,
                    icon: ach.icon,
                    requirements: ach.requirements as Record<string, any>,
                    rewards: ach.rewards as Record<string, any>,
                    isActive: ach.isActive,
                    orderIndex: ach.orderIndex,
                },
            };
        });
    }

    /**
     * Ensure all hardcoded achievements exist in database
     */
    private async ensureAchievementsExist(): Promise<void> {
        for (const def of ACHIEVEMENT_DEFINITIONS) {
            await this.prisma.achievement.upsert({
                where: { code: def.code },
                update: {
                    category: def.category as any,
                    title: def.title,
                    description: def.description,
                    icon: def.icon,
                    requirements: def.requirements,
                    rewards: def.rewards,
                    orderIndex: def.orderIndex,
                    isActive: true,
                },
                create: {
                    code: def.code,
                    category: def.category as any,
                    title: def.title,
                    description: def.description,
                    icon: def.icon,
                    requirements: def.requirements,
                    rewards: def.rewards,
                    orderIndex: def.orderIndex,
                    isActive: true,
                },
            });
        }
    }

    /**
     * Check and unlock achievements based on streak milestones
     */
    async checkStreakAchievements(
        userId: string,
        currentStreak: number,
    ): Promise<void> {
        const milestones = [
            { streak: 3, code: 'STREAK_3' },
            { streak: 7, code: 'STREAK_7' },
            { streak: 14, code: 'STREAK_14' },
            { streak: 30, code: 'STREAK_30' },
            { streak: 100, code: 'STREAK_100' },
        ];

        for (const milestone of milestones) {
            if (currentStreak >= milestone.streak) {
                await this.unlockAchievement(userId, milestone.code);
            }
        }
    }

    /**
     * Check lesson completion achievements
     */
    async checkLessonAchievements(userId: string): Promise<void> {
        const lessonsCompleted = await this.prisma.lessonProgress.count({
            where: {
                enrollment: { userId },
                status: 'completed',
            },
        });

        const milestones = [
            { count: 1, code: 'FIRST_LESSON' },
            { count: 50, code: 'LESSON_50' },
        ];

        for (const milestone of milestones) {
            if (lessonsCompleted >= milestone.count) {
                await this.unlockAchievement(userId, milestone.code);
            }
        }
    }

    /**
     * Check course completion achievements
     */
    async checkCourseAchievements(userId: string): Promise<void> {
        const coursesCompleted = await this.prisma.enrollment.count({
            where: { userId, completionStatus: 'completed' },
        });

        const milestones = [
            { count: 1, code: 'FIRST_COURSE' },
            { count: 5, code: 'COURSE_5' },
        ];

        for (const milestone of milestones) {
            if (coursesCompleted >= milestone.count) {
                await this.unlockAchievement(userId, milestone.code);
            }
        }
    }

    /**
     * Check quiz mastery achievements
     */
    async checkQuizAchievements(
        userId: string,
        score: number,
        jlptLevel?: string,
        quizType: string = 'practice',
    ): Promise<void> {
        // 1. Check Perfect score (100%)
        if (score >= 100) {
            // General perfect score achievement
            await this.unlockAchievement(userId, 'PERFECT_SCORE');

            // Specific JLPT level perfect score
            if (jlptLevel) {
                const achievementCode = `QUIZ_PERFECT_${jlptLevel}`;
                await this.unlockAchievement(userId, achievementCode);
            }
        }

        // 2. Check counts for Quiz (practice/lesson) vs Exam (jlpt_mock)
        const isExam = quizType === 'jlpt_mock';

        if (isExam) {
            const examsCompleted = await this.prisma.quizAttempt.count({
                where: {
                    userId,
                    quiz: { quizType: 'jlpt_mock' },
                    status: { in: ['submitted', 'completed'] },
                },
            });

            const milestones = [
                { count: 1, code: 'FIRST_EXAM' },
                { count: 10, code: 'EXAM_MASTER' },
            ];

            for (const milestone of milestones) {
                if (examsCompleted >= milestone.count) {
                    await this.unlockAchievement(userId, milestone.code);
                }
            }
        } else {
            // Regular Quiz counts
            const quizzesCompleted = await this.prisma.quizAttempt.count({
                where: {
                    userId,
                    quiz: { quizType: { not: 'jlpt_mock' } },
                    status: { in: ['submitted', 'completed'] },
                },
            });

            if (quizzesCompleted >= 50) {
                await this.unlockAchievement(userId, 'QUIZ_WARRIOR');
            }
        }
    }

    /**
     * Check consistency achievements
     */
    async checkConsistencyAchievements(userId: string): Promise<void> {
        const activities = await this.prisma.dailyActivity.findMany({
            where: { userId },
            select: { date: true },
            distinct: ['date'],
        });

        if (activities.length === 0) return;

        // Group by weeks
        const weeksMap = new Map<string, Set<string>>();
        activities.forEach((a) => {
            const date = new Date(a.date);
            const weekKey = this.getWeekNumber(date);
            if (!weeksMap.has(weekKey)) {
                weeksMap.set(weekKey, new Set());
            }
            weeksMap.get(weekKey)!.add(a.date);
        });

        let weeksWithFiveDays = 0;
        weeksMap.forEach((days) => {
            if (days.size >= 5) {
                weeksWithFiveDays++;
            }
        });

        if (weeksWithFiveDays >= 4) {
            await this.unlockAchievement(userId, 'WEEKLY_WARRIOR');
        }
    }

    private getWeekNumber(date: Date): string {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
        return `${d.getUTCFullYear()}-W${weekNo}`;
    }

    /**
     * Check flashcard achievements
     */
    async checkFlashcardAchievements(userId: string): Promise<void> {
        const reviewCount = await this.prisma.flashcardReview.count({
            where: { userId },
        });

        const milestones = [
            { count: 100, code: 'FLASHCARD_100' },
            { count: 1000, code: 'FLASHCARD_1000' },
        ];

        for (const milestone of milestones) {
            if (reviewCount >= milestone.count) {
                await this.unlockAchievement(userId, milestone.code);
            }
        }
    }

    /**
     * Unlock achievement for user
     */
    async unlockAchievement(
        userId: string,
        achievementCode: string,
    ): Promise<void> {
        // Ensure achievement exists in DB
        await this.ensureAchievementsExist();

        // Find achievement
        const achievement = await this.prisma.achievement.findUnique({
            where: { code: achievementCode },
        });

        if (!achievement || !achievement.isActive) {
            return;
        }

        // Check if already unlocked
        const existing = await this.prisma.userAchievement.findUnique({
            where: {
                userId_achievementId: {
                    userId,
                    achievementId: achievement.id,
                },
            },
        });

        if (existing?.isUnlocked) {
            return; // Already unlocked
        }

        // Unlock achievement
        await this.prisma.userAchievement.upsert({
            where: {
                userId_achievementId: {
                    userId,
                    achievementId: achievement.id,
                },
            },
            update: {
                isUnlocked: true,
                unlockedAt: new Date(),
            },
            create: {
                userId,
                achievementId: achievement.id,
                isUnlocked: true,
                unlockedAt: new Date(),
            },
        });

        this.logger.log(`User ${userId} unlocked achievement: ${achievementCode}`);

        // Apply rewards
        await this.applyRewards(userId, achievement.rewards as Record<string, any>);

        // Emit event for notification
        const event: AchievementUnlockedEvent = {
            userId,
            achievementId: achievement.id,
            achievementCode: achievement.code,
            achievementTitle: achievement.title,
            rewards: achievement.rewards as Record<string, any>,
            timestamp: new Date().toISOString(),
        };

        this.natsClient.emit('achievement.unlocked', event);
    }

    /**
     * Apply achievement rewards to user
     */
    private async applyRewards(
        userId: string,
        rewards: Record<string, any>,
    ): Promise<void> {
        // Grant freeze count
        if (rewards.freezeCount && typeof rewards.freezeCount === 'number') {
            await this.prisma.userGamification.upsert({
                where: { userId },
                update: {
                    freezeCount: { increment: rewards.freezeCount },
                },
                create: {
                    userId,
                    freezeCount: rewards.freezeCount,
                    totalXp: 0,
                    level: 1,
                },
            });
        }

        // Other rewards can be implemented here (XP, badges, etc.)
    }
}
