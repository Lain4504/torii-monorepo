import { Injectable, Logger, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '@server/shared';
import type {
  UserAchievementDto,
  AchievementUnlockedEvent,
} from '@workspace/schemas';
import type { IAchievementsService } from '@server/gamification/interfaces/services';
import type { IAchievementsRepository } from '@server/gamification/interfaces/repositories';
import { ACHIEVEMENTS_REPOSITORY_TOKEN } from '@server/gamification/interfaces/repositories';
import { PROFILES_SERVICE_TOKEN } from '@server/gamification/interfaces/services';
import type { IProfilesService } from '@server/gamification/interfaces/services';

const ACHIEVEMENT_DEFINITIONS = [
  {
    code: 'STREAK_3',
    category: 'STREAK',
    title: 'Người mới bắt đầu',
    description: 'Học liên tục 3 ngày',
    icon: 'Flame',
    requirements: { streakDays: 3 },
    rewards: { freezeCount: 1 },
    orderIndex: 1,
  },
  {
    code: 'STREAK_7',
    category: 'STREAK',
    title: 'Tuần hoàn hảo',
    description: 'Học liên tục 7 ngày',
    icon: 'Calendar',
    requirements: { streakDays: 7 },
    rewards: { freezeCount: 2 },
    orderIndex: 2,
  },
  {
    code: 'STREAK_14',
    category: 'STREAK',
    title: 'Hai tuần quyết tâm',
    description: 'Học liên tục 14 ngày',
    icon: 'TrendingUp',
    requirements: { streakDays: 14 },
    rewards: { freezeCount: 3 },
    orderIndex: 3,
  },
  {
    code: 'STREAK_30',
    category: 'STREAK',
    title: 'Tháng thành công',
    description: 'Học liên tục 30 ngày',
    icon: 'Trophy',
    requirements: { streakDays: 30 },
    rewards: { freezeCount: 5 },
    orderIndex: 4,
  },
  {
    code: 'STREAK_100',
    category: 'STREAK',
    title: 'Bậc thầy kiên trì',
    description: 'Học liên tục 100 ngày',
    icon: 'Star',
    requirements: { streakDays: 100 },
    rewards: { freezeCount: 10 },
    orderIndex: 5,
  },
  {
    code: 'FIRST_LESSON',
    category: 'LEARNING_PROGRESS',
    title: 'Bài học đầu tiên',
    description: 'Hoàn thành bài học đầu tiên',
    icon: 'BookOpen',
    requirements: { lessonsCompleted: 1 },
    rewards: {},
    orderIndex: 6,
  },
  {
    code: 'LESSON_50',
    category: 'LEARNING_PROGRESS',
    title: 'Người học tích cực',
    description: 'Hoàn thành 50 bài học',
    icon: 'Target',
    requirements: { lessonsCompleted: 50 },
    rewards: { freezeCount: 1 },
    orderIndex: 7,
  },
  {
    code: 'FIRST_COURSE',
    category: 'LEARNING_PROGRESS',
    title: 'Bước đầu tiên',
    description: 'Hoàn thành khóa học đầu tiên',
    icon: 'GraduationCap',
    requirements: { coursesCompleted: 1 },
    rewards: {},
    orderIndex: 8,
  },
  {
    code: 'COURSE_5',
    category: 'LEARNING_PROGRESS',
    title: 'Người học chăm chỉ',
    description: 'Hoàn thành 5 khóa học',
    icon: 'Award',
    requirements: { coursesCompleted: 5 },
    rewards: { freezeCount: 2 },
    orderIndex: 9,
  },
  {
    code: 'QUIZ_PERFECT_N5',
    category: 'MASTERY',
    title: 'Thành thạo N5',
    description: 'Đạt 100% trong bài kiểm tra N5',
    icon: 'Zap',
    requirements: { quizScore: 100, jlptLevel: 'N5' },
    rewards: {},
    orderIndex: 10,
  },
  {
    code: 'QUIZ_PERFECT_N4',
    category: 'MASTERY',
    title: 'Thành thạo N4',
    description: 'Đạt 100% trong bài kiểm tra N4',
    icon: 'Zap',
    requirements: { quizScore: 100, jlptLevel: 'N4' },
    rewards: { freezeCount: 1 },
    orderIndex: 11,
  },
  {
    code: 'QUIZ_PERFECT_N3',
    category: 'MASTERY',
    title: 'Thành thạo N3',
    description: 'Đạt 100% trong bài kiểm tra N3',
    icon: 'Zap',
    requirements: { quizScore: 100, jlptLevel: 'N3' },
    rewards: { freezeCount: 2 },
    orderIndex: 12,
  },
  {
    code: 'FLASHCARD_100',
    category: 'MASTERY',
    title: 'Người ghi nhớ',
    description: 'Ôn tập 100 flashcard',
    icon: 'Heart',
    requirements: { flashcardsReviewed: 100 },
    rewards: {},
    orderIndex: 13,
  },
  {
    code: 'FLASHCARD_1000',
    category: 'MASTERY',
    title: 'Bậc thầy ghi nhớ',
    description: 'Ôn tập 1000 flashcard',
    icon: 'Star',
    requirements: { flashcardsReviewed: 1000 },
    rewards: { freezeCount: 5 },
    orderIndex: 14,
  },
  {
    code: 'WEEKLY_WARRIOR',
    category: 'CONSISTENCY',
    title: 'Chiến binh tuần lễ',
    description: 'Học ít nhất 5 ngày/tuần trong 4 tuần',
    icon: 'Calendar',
    requirements: { weeksWithFiveDays: 4 },
    rewards: { freezeCount: 3 },
    orderIndex: 15,
  },
];

@Injectable()
export class AchievementsService implements IAchievementsService {
  private readonly logger = new Logger(AchievementsService.name);

  constructor(
    @Inject(ACHIEVEMENTS_REPOSITORY_TOKEN)
    private readonly achievementsRepository: IAchievementsRepository,
    @Inject(PROFILES_SERVICE_TOKEN)
    private readonly profilesService: IProfilesService,
    private readonly prisma: PrismaService, // For counting logic across tables
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  async getUserAchievements(userId: string): Promise<UserAchievementDto[]> {
    await this.ensureAchievementsExist();
    const allAchievements = await this.achievementsRepository.findAllActive();
    const userAchievements =
      await this.achievementsRepository.findByUserId(userId);
    const userAchMap = new Map(
      userAchievements.map((ua) => [ua.achievementId, ua]),
    );

    return allAchievements.map((ach) => {
      const userAch = userAchMap.get(ach.id);
      return {
        id: userAch?.id || `temp-${ach.id}`,
        achievementId: ach.id,
        isUnlocked: userAch?.isUnlocked || false,
        progress: userAch?.progress,
        unlockedAt: userAch?.unlockedAt?.toISOString() || null,
        achievement: ach,
      };
    });
  }

  private async ensureAchievementsExist(): Promise<void> {
    for (const def of ACHIEVEMENT_DEFINITIONS) {
      await this.achievementsRepository.upsertAchievement(def.code, {
        category: def.category,
        title: def.title,
        description: def.description,
        icon: def.icon,
        requirements: def.requirements,
        rewards: def.rewards,
        orderIndex: def.orderIndex,
        isActive: true,
      });
    }
  }

  async checkStreakAchievements(
    userId: string,
    currentStreak: number,
  ): Promise<void> {
    const milestones = [3, 7, 14, 30, 100];
    for (const streak of milestones) {
      if (currentStreak >= streak) {
        await this.unlockAchievement(userId, `STREAK_${streak}`);
      }
    }
  }

  async checkLessonAchievements(userId: string): Promise<void> {
    const lessonsCompleted = await this.prisma.lessonProgress.count({
      where: { enrollment: { userId }, status: 'completed' },
    });
    if (lessonsCompleted >= 1)
      await this.unlockAchievement(userId, 'FIRST_LESSON');
    if (lessonsCompleted >= 50)
      await this.unlockAchievement(userId, 'LESSON_50');
  }

  async checkCourseAchievements(userId: string): Promise<void> {
    const coursesCompleted = await this.prisma.enrollment.count({
      where: { userId, completionStatus: 'completed' },
    });
    if (coursesCompleted >= 1)
      await this.unlockAchievement(userId, 'FIRST_COURSE');
    if (coursesCompleted >= 5) await this.unlockAchievement(userId, 'COURSE_5');
  }

  async checkQuizAchievements(
    userId: string,
    score: number,
    jlptLevel: string,
  ): Promise<void> {
    if (score >= 100) {
      await this.unlockAchievement(userId, `QUIZ_PERFECT_${jlptLevel}`);
    }
  }

  async checkFlashcardAchievements(userId: string): Promise<void> {
    const reviewCount = await this.prisma.flashcardReview.count({
      where: { userId },
    });
    if (reviewCount >= 100)
      await this.unlockAchievement(userId, 'FLASHCARD_100');
    if (reviewCount >= 1000)
      await this.unlockAchievement(userId, 'FLASHCARD_1000');
  }

  async unlockAchievement(
    userId: string,
    achievementCode: string,
  ): Promise<void> {
    const achievement =
      await this.achievementsRepository.findByCode(achievementCode);
    if (!achievement || !achievement.isActive) return;

    const existing = await this.achievementsRepository.findUserAchievement(
      userId,
      achievement.id,
    );
    if (existing?.isUnlocked) return;

    await this.achievementsRepository.upsertUserAchievement(
      userId,
      achievement.id,
      {
        isUnlocked: true,
        unlockedAt: new Date(),
      },
    );

    await this.applyRewards(userId, achievement.rewards as Record<string, any>);

    this.natsClient.emit('achievement.unlocked', {
      userId,
      achievementId: achievement.id,
      achievementCode: achievement.code,
      achievementTitle: achievement.title,
      rewards: achievement.rewards as Record<string, any>,
      timestamp: new Date().toISOString(),
    });
  }

  private async applyRewards(
    userId: string,
    rewards: Record<string, any>,
  ): Promise<void> {
    if (rewards.freezeCount && typeof rewards.freezeCount === 'number') {
      await this.profilesService.grantFreeze(userId, rewards.freezeCount);
    }
  }
}
