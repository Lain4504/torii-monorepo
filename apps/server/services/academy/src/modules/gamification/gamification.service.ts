import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
  ActivityType,
  GamificationTransactionType,
  GamificationCurrency,
  CouponScope,
} from '@prisma/generated';
import { AchievementService } from './achievement.service';
import { AuditLoggerService } from '../audit-logger.service';

@Injectable()
export class GamificationService {
  private readonly logger = new Logger(GamificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly achievementService: AchievementService,
    private readonly audit: AuditLoggerService,
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  private getVnDateString(d: Date = new Date()) {
    const vn = new Date(
      d.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }),
    );
    const y = vn.getFullYear();
    const m = String(vn.getMonth() + 1).padStart(2, '0');
    const day = String(vn.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private diffDays(aDateStr: string, bDateStr: string) {
    const a = Date.parse(`${aDateStr}T00:00:00.000Z`);
    const b = Date.parse(`${bDateStr}T00:00:00.000Z`);
    return Math.round((b - a) / (1000 * 60 * 60 * 24));
  }

  /**
   * Chuỗi ngày liên tiếp: diff=1 → +1; diff=2 + còn freeze → dùng 1 freeze coi như nối được (miss 1 ngày);
   * diff>2 hoặc hết freeze → reset về 1.
   */
  private computeStreakTransition(
    lastActive: string | null,
    todayStr: string,
    currentStreak: number,
    maxStreak: number,
    freezeCount: number,
  ): { nextStreak: number; nextMax: number; freezeConsumed: number } {
    if (!lastActive) {
      return { nextStreak: 1, nextMax: Math.max(maxStreak, 1), freezeConsumed: 0 };
    }
    if (lastActive === todayStr) {
      return {
        nextStreak: currentStreak,
        nextMax: maxStreak,
        freezeConsumed: 0,
      };
    }
    const diff = this.diffDays(lastActive, todayStr);
    if (diff === 1) {
      const ns = currentStreak + 1;
      return { nextStreak: ns, nextMax: Math.max(maxStreak, ns), freezeConsumed: 0 };
    }
    if (diff === 2 && freezeCount > 0) {
      const ns = currentStreak + 1;
      return { nextStreak: ns, nextMax: Math.max(maxStreak, ns), freezeConsumed: 1 };
    }
    return { nextStreak: 1, nextMax: Math.max(maxStreak, 1), freezeConsumed: 0 };
  }

  /**
   * Một nguồn sự thật cho streak: bảng `streaks` + đồng bộ `user_gamification` (leaderboard / profile).
   */
  /** `tx`: client trong callback `prisma.$transaction`. */
  private async applyDailyStreakAndSync(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tx: any,
    userId: string,
    dateString: string,
  ): Promise<{ streakSavedByFreeze: boolean }> {
    await tx.userGamification.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        currentXp: 0,
        totalXp: 0,
        points: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
      },
    });

    const prof = await tx.userGamification.findUnique({ where: { userId } });
    const freezeCount = prof?.freezeCount ?? 0;

    await tx.streakLog.upsert({
      where: {
        userId_date: {
          userId,
          date: dateString,
        },
      },
      update: { status: 'ACTIVE' },
      create: {
        userId,
        date: dateString,
        status: 'ACTIVE',
      },
    });

    let streakRow = await tx.streak.findUnique({ where: { userId } });
    if (!streakRow) {
      await tx.streak.create({
        data: {
          userId,
          currentStreak: 1,
          maxStreak: 1,
          lastActiveDate: dateString,
          freezeUsedToday: false,
        },
      });
      await tx.userGamification.update({
        where: { userId },
        data: {
          currentStreak: 1,
          longestStreak: 1,
          lastActiveDate: dateString,
        },
      });
      return { streakSavedByFreeze: false };
    }

    if (streakRow.lastActiveDate === dateString) {
      await tx.userGamification.update({
        where: { userId },
        data: {
          currentStreak: streakRow.currentStreak,
          longestStreak: streakRow.maxStreak,
          lastActiveDate: streakRow.lastActiveDate,
        },
      });
      return { streakSavedByFreeze: false };
    }

    const t = this.computeStreakTransition(
      streakRow.lastActiveDate,
      dateString,
      streakRow.currentStreak,
      streakRow.maxStreak,
      freezeCount,
    );
    const streakSavedByFreeze = t.freezeConsumed > 0;

    await tx.streak.update({
      where: { userId },
      data: {
        currentStreak: t.nextStreak,
        maxStreak: t.nextMax,
        lastActiveDate: dateString,
        freezeUsedToday: streakSavedByFreeze,
      },
    });

    await tx.userGamification.update({
      where: { userId },
      data: {
        currentStreak: t.nextStreak,
        longestStreak: t.nextMax,
        lastActiveDate: dateString,
        ...(t.freezeConsumed > 0 ? { freezeCount: { decrement: t.freezeConsumed } } : {}),
      },
    });

    return { streakSavedByFreeze };
  }

  private readonly EARNING_RULES: Record<
    string,
    { xp: number; points: number }
  > = {
    [ActivityType.LOGIN]: { xp: 5, points: 5 },
    [ActivityType.LESSON_COMPLETE]: { xp: 10, points: 10 },
    [ActivityType.EXAM_COMPLETE]: { xp: 20, points: 20 },
    [ActivityType.REVIEW]: { xp: 50, points: 50 },
    [ActivityType.FLASHCARD_REVIEW]: { xp: 5, points: 5 },
    [ActivityType.QUIZ_ANSWER]: { xp: 1, points: 0 },
    [ActivityType.PRACTICE]: { xp: 2, points: 0 },
  };

  private readonly ACTIVITY_WEIGHTS: Record<string, number> = {
    [ActivityType.LOGIN]: 1,
    [ActivityType.LESSON_COMPLETE]: 5,
    [ActivityType.EXAM_COMPLETE]: 10,
    [ActivityType.REVIEW]: 3,
    [ActivityType.FLASHCARD_REVIEW]: 2,
    [ActivityType.QUIZ_ANSWER]: 1,
    [ActivityType.PRACTICE]: 1,
  };

  private readonly DAILY_XP_CAP: Partial<Record<ActivityType, number>> = {
    [ActivityType.QUIZ_ANSWER]: 20,
    [ActivityType.FLASHCARD_REVIEW]: 15,
    [ActivityType.PRACTICE]: 10,
  };

  private readonly DAILY_POINTS_CAP: Partial<Record<ActivityType, number>> = {
    [ActivityType.LOGIN]: 5,
    [ActivityType.FLASHCARD_REVIEW]: 20,
  };

  /**
   * Track a user learning activity and reward them.
   * Also updates streak based on real learning activities instead of simple logins.
   */
  async trackActivity(
    userId: string,
    activityType: ActivityType,
    metadata: any = {},
  ) {
    const rule = this.EARNING_RULES[activityType];
    if (!rule) {
      return {
        amount: 0,
        message: 'No points awarded for this activity.',
      };
    }

    const dateString = this.getVnDateString();

    // Points/XP Award Eligibility Check
    let shouldAward = true;

    if (activityType === ActivityType.LOGIN) {
      // LOGIN chỉ thưởng một lần/ngày (bất kỳ bản ghi EARN nào: XP hoặc POINT)
      const existingLoginAward =
        await this.prisma.gamificationHistory.findFirst({
          where: {
            userId,
            activityType: ActivityType.LOGIN,
            type: GamificationTransactionType.EARN,
            createdAt: {
              gte: new Date(`${dateString}T00:00:00.000Z`),
              lt: new Date(`${dateString}T23:59:59.999Z`),
            },
          },
        });
      if (existingLoginAward) {
        shouldAward = false;
      }
    } else if (activityType === ActivityType.REVIEW && metadata?.reviewId) {
      // Ensure no duplicate points for the same review
      const existingHistory = await this.prisma.gamificationHistory.findFirst({
        where: {
          userId,
          activityType: ActivityType.REVIEW,
          metadata: { path: ['reviewId'], equals: metadata.reviewId },
        },
      });

      if (existingHistory) {
        shouldAward = false;
      }
    } else if (
      activityType === ActivityType.LESSON_COMPLETE &&
      metadata?.lessonId
    ) {
      // Ensure each lesson only rewards XP/points once per user
      const existingLessonHistory =
        await this.prisma.gamificationHistory.findFirst({
          where: {
            userId,
            activityType: ActivityType.LESSON_COMPLETE,
            metadata: { path: ['lessonId'], equals: metadata.lessonId },
          },
        });

      if (existingLessonHistory) {
        shouldAward = false;
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const { streakSavedByFreeze } = await this.applyDailyStreakAndSync(
        tx,
        userId,
        dateString,
      );

      if (!shouldAward) {
        return {
          xpEarned: 0,
          pointsEarned: 0,
          streakSavedByFreeze,
          message:
            'Activity tracked, but rewards already awarded for this item/day.',
        };
      }

      let profile = await tx.userGamification.findUnique({ where: { userId } });
      if (!profile) {
        profile = await tx.userGamification.create({
          data: {
            userId,
            currentXp: 0,
            totalXp: 0,
            points: 0,
            level: 1,
          },
        });
      }

      // --- Caps & dedup ---
      const start = new Date(`${dateString}T00:00:00.000Z`);
      const end = new Date(`${dateString}T23:59:59.999Z`);

      // Dedup per object for mini-games (optional metadata keys)
      const dedupKey = metadata?.lessonId
        ? `lesson:${metadata.lessonId}`
        : metadata?.setId
          ? `set:${metadata.setId}`
          : metadata?.quizId
            ? `quiz:${metadata.quizId}`
            : metadata?.gameId
              ? `game:${metadata.gameId}`
              : null;

      if (dedupKey) {
        const existing = await tx.gamificationHistory.findFirst({
          where: {
            userId,
            activityType,
            type: GamificationTransactionType.EARN,
            createdAt: { gte: start, lte: end },
            metadata: { path: ['dedupKey'], equals: dedupKey },
          },
        });
        if (existing) {
          return {
            xpEarned: 0,
            pointsEarned: 0,
            streakSavedByFreeze,
            message: 'Duplicate reward for this item today.',
          };
        }
      }

      const { xp, points } = rule;
      let xpAward = xp;
      let pointsAward = points;

      const xpCap = this.DAILY_XP_CAP[activityType];
      if (xpCap != null && xpAward > 0) {
        const s = await tx.gamificationHistory.aggregate({
          where: {
            userId,
            activityType,
            currency: GamificationCurrency.XP,
            type: GamificationTransactionType.EARN,
            createdAt: { gte: start, lte: end },
          },
          _sum: { amount: true },
        });
        const used = s._sum.amount ?? 0;
        xpAward = Math.max(0, Math.min(xpAward, xpCap - used));
      }

      const pointsCap = this.DAILY_POINTS_CAP[activityType];
      if (pointsCap != null && pointsAward > 0) {
        const s = await tx.gamificationHistory.aggregate({
          where: {
            userId,
            activityType,
            currency: GamificationCurrency.POINT,
            type: GamificationTransactionType.EARN,
            createdAt: { gte: start, lte: end },
          },
          _sum: { amount: true },
        });
        const used = s._sum.amount ?? 0;
        pointsAward = Math.max(0, Math.min(pointsAward, pointsCap - used));
      }

      const rewardMeta = {
        ...metadata,
        date: dateString,
        source: 'ACTIVITY',
        ...(dedupKey ? { dedupKey } : {}),
      };

      if (xpAward === 0 && pointsAward === 0) {
        return {
          xpEarned: 0,
          pointsEarned: 0,
          streakSavedByFreeze,
          message: 'Daily cap reached.',
        };
      }

      const XP_PER_LEVEL = 1000;
      const newTotalXp = profile.totalXp + xpAward;
      const newLevel = Math.floor(newTotalXp / XP_PER_LEVEL) + 1;
      const newCurrentXp = newTotalXp % XP_PER_LEVEL;

      const updatedProfile = await tx.userGamification.update({
        where: { userId },
        data: {
          totalXp: newTotalXp,
          currentXp: newCurrentXp,
          points: { increment: pointsAward },
          level: newLevel,
        },
      });

      // Write point tracking in history
      if (pointsAward > 0) {
        await tx.gamificationHistory.create({
          data: {
            userId,
            amount: pointsAward,
            currency: GamificationCurrency.POINT,
            type: GamificationTransactionType.EARN,
            activityType,
            description: `Received points for ${activityType}`,
            metadata: rewardMeta,
          },
        });
      }

      if (xpAward > 0) {
        await tx.gamificationHistory.create({
          data: {
            userId,
            amount: xpAward,
            currency: GamificationCurrency.XP,
            type: GamificationTransactionType.EARN,
            activityType,
            description: `Received XP for ${activityType}`,
            metadata: rewardMeta,
          },
        });
      }

      const result = {
        xpEarned: xpAward,
        pointsEarned: pointsAward,
        newLevel: updatedProfile.level,
        streakSavedByFreeze,
      };

      // Level up notification (only when level actually increases)
      if (newLevel > profile.level) {
        try {
          this.natsClient.emit(
            { cmd: 'send_notification' },
            {
              recipientId: userId,
              type: 'system',
              payload: {
                title: 'Bạn vừa lên cấp độ mới ⭐',
                body: `Chúc mừng! Bạn đã đạt cấp độ ${newLevel}. Tiếp tục học để mở khóa thêm thành tựu và phần thưởng.`,
                metadata: {
                  previousLevel: profile.level,
                  newLevel,
                  activityType,
                },
              },
            },
          );
        } catch (error: any) {
          this.logger.error(
            `Failed to emit level-up notification for user ${userId}: ${error.message}`,
          );
        }
      }

      // Update streak & evaluate achievements asynchronously based on this activity
      // Note: we don't await to keep the main transaction fast
      this.achievementService
        .evaluateForUser(userId)
        .catch((err) =>
          this.logger.error(
            `Failed to update streak/achievements for user ${userId}:`,
            err,
          ),
        );

      return result;
    });
  }

  /**
   * Get gamification profile WITHOUT mutating streak or tracking login.
   * Streak is now updated only when real learning activities are recorded.
   */
  async getProfile(userId: string) {
    let profile = await this.prisma.userGamification.findUnique({
      where: { userId },
    });
    if (!profile) {
      profile = await this.prisma.userGamification.create({
        data: {
          userId,
          currentXp: 0,
          totalXp: 0,
          points: 0,
          level: 1,
        },
      });
    }
    return profile;
  }

  /**
   * Trạng thái streak chỉ đọc (không ghi streak / streak_log).
   * Streak được cập nhật trong `trackActivity` (LOGIN qua NATS, học bài, …).
   */
  async getStreakStatus(userId: string) {
    let profile = await this.prisma.userGamification.findUnique({
      where: { userId },
    });

    if (!profile) {
      profile = await this.prisma.userGamification.create({
        data: { userId, currentXp: 0, totalXp: 0, points: 0, level: 1 },
      });
    }

    const todayStr = this.getVnDateString();
    const streak = await this.prisma.streak.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        currentStreak: 0,
        maxStreak: 0,
        lastActiveDate: null,
        freezeUsedToday: false,
      },
    });

    const isActiveToday = streak.lastActiveDate === todayStr;
    const willBreakTomorrow =
      isActiveToday && (streak.currentStreak ?? 0) > 0;

    // Show once/day across devices (persisted)
    const shouldShowToast = profile.lastToastShownDate !== todayStr;

    const recent = await this.prisma.streakLog.findMany({
      where: { userId, status: 'ACTIVE' },
      select: { date: true },
      orderBy: { date: 'desc' },
      take: 14,
    });

    // Derive counts from streak logs (DailyActivity removed)
    const totalActiveDays = await this.prisma.streakLog.count({
      where: { userId, status: 'ACTIVE' },
    });

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const monthAgo = new Date(now);
    monthAgo.setDate(now.getDate() - 30);

    const toDateStr = (d: Date) => this.getVnDateString(d);
    const weeklyActiveCount = await this.prisma.streakLog.count({
      where: {
        userId,
        status: 'ACTIVE',
        date: { gte: toDateStr(weekAgo), lte: todayStr },
      },
    });
    const monthlyActiveCount = await this.prisma.streakLog.count({
      where: {
        userId,
        status: 'ACTIVE',
        date: { gte: toDateStr(monthAgo), lte: todayStr },
      },
    });

    return {
      currentStreak: streak.currentStreak ?? 0,
      longestStreak: streak.maxStreak ?? 0,
      freezeCount: profile.freezeCount ?? 0,
      streakSavedByFreeze: streak.freezeUsedToday ?? false,
      isActiveToday,
      willBreakTomorrow,
      lastActiveDate: streak.lastActiveDate ?? null,
      totalActiveDays,
      weeklyActiveCount,
      monthlyActiveCount,
      recentActiveDates: recent.map((r) => r.date),
      shouldShowToast,
    };
  }

  async markToastShown(userId: string) {
    const todayStr = this.getVnDateString();
    await this.prisma.userGamification.upsert({
      where: { userId },
      update: { lastToastShownDate: todayStr },
      create: {
        userId,
        currentXp: 0,
        totalXp: 0,
        points: 0,
        level: 1,
        lastToastShownDate: todayStr,
      },
    });
    return { success: true };
  }

  async getLeaderboard(userId: string, type?: string) {
    const mode = (type || 'global') as 'global' | 'streak';
    const orderBy =
      mode === 'streak'
        ? ({ currentStreak: 'desc' } as const)
        : ({ totalXp: 'desc' } as const);

    const top = await this.prisma.userGamification.findMany({
      orderBy,
      take: 50,
      select: {
        userId: true,
        level: true,
        totalXp: true,
        currentStreak: true,
        user: { select: { id: true, displayName: true, avatarUrl: true } },
      },
    });

    const users = top.map((g) => ({
      id: g.user.id,
      displayName: g.user.displayName,
      avatarUrl: g.user.avatarUrl,
      xp: g.totalXp,
      streak: g.currentStreak,
      level: g.level,
    }));

    const current = await this.prisma.userGamification.findUnique({
      where: { userId },
      select: {
        userId: true,
        level: true,
        totalXp: true,
        currentStreak: true,
        user: { select: { id: true, displayName: true, avatarUrl: true } },
      },
    });

    const currentUser = current
      ? {
          id: current.user.id,
          displayName: current.user.displayName,
          avatarUrl: current.user.avatarUrl,
          xp: current.totalXp,
          streak: current.currentStreak,
          level: current.level,
        }
      : null;

    return { users, currentUser };
  }

  async getHistory(userId: string, limit: number = 20, offset: number = 0) {
    return this.prisma.gamificationHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });
  }

  async getRewards() {
    return this.prisma.pointReward.findMany({
      where: { isActive: true },
    });
  }

  async redeemReward(userId: string, rewardId: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const reward = await tx.pointReward.findUnique({
        where: { id: rewardId },
      });

      if (!reward || !reward.isActive) {
        throw new NotFoundException('Reward not found or inactive');
      }

      const profile = await tx.userGamification.findUnique({
        where: { userId },
      });

      if (!profile || profile.points < reward.costPoints) {
        throw new BadRequestException(
          'Insufficient points to redeem this reward',
        );
      }

      // Deduct points
      await tx.userGamification.update({
        where: { userId },
        data: {
          points: { decrement: reward.costPoints },
        },
      });

      await tx.gamificationHistory.create({
        data: {
          userId,
          amount: -reward.costPoints,
          currency: GamificationCurrency.POINT,
          type: GamificationTransactionType.REDEEM,
          description: `Redeemed ${reward.name}`,
          metadata: { rewardId },
        },
      });

      // NOTE: A real system should integrate with CouponService here to emit a real coupon.
      // Simplified coupon issuance for Phase 1
      const config = (reward.config as any) || {};
      const prefix = config.prefix || 'RWD';
      const generatedCode = `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const coupon = await tx.coupon.create({
        data: {
          code: generatedCode,
          name: reward.name,
          description: `Redeemed from: ${reward.name}`,
          discountType: config.discountType || 'FIXED_AMOUNT',
          discountValue: config.discountValue || 0,
          maxDiscountAmount: config.maxDiscountAmount,
          minOrderValue: config.minOrderValue,
          usageLimit: 1,
          perUserLimit: 1,
          // Mark this as a personal coupon owned by the redeemer
          scope: CouponScope.GLOBAL,
          ownerId: userId,
          source: 'GAMIFICATION_REWARD',
          metadata: {
            ...(reward.config as any),
            source: 'GAMIFICATION_REWARD',
            rewardId: reward.id,
            rewardName: reward.name,
          },
        },
      });

      return {
        success: true,
        message: 'Reward redeemed successfully',
        couponCode: coupon.code,
        rewardName: reward.name,
      };
    });

    // Emit notification via NATS (identity service will create in-app notification)
    try {
      this.natsClient.emit(
        { cmd: 'send_notification' },
        {
          recipientId: userId,
          type: 'system',
          payload: {
            title: 'Bạn vừa đổi quà thành công 🎁',
            body: `Bạn đã dùng điểm để đổi phần thưởng "${result.rewardName}". Mã coupon của bạn là ${result.couponCode}.`,
            metadata: {
              rewardId,
              rewardName: result.rewardName,
              couponCode: result.couponCode,
            },
          },
        },
      );
    } catch (error: any) {
      this.logger.error(
        `Failed to emit notification for redeemReward user=${userId}, reward=${rewardId}: ${error.message}`,
      );
    }

    return {
      success: result.success,
      message: result.message,
      couponCode: result.couponCode,
    };
  }

  // --- Admin CRUD ---

  async admin_getAllRewards() {
    return this.prisma.pointReward.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async admin_createReward(data: any, requesterId = 'SYSTEM') {
    const reward = await this.prisma.pointReward.create({
      data: {
        name: data.name,
        description: data.description,
        costPoints: data.costPoints,
        type: data.type || 'COUPON',
        config: data.config || {},
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'gamification.reward.create',
      entity: 'PointReward',
      entityId: reward.id,
      description: `Created reward: ${reward.name} (${reward.costPoints} points)`,
      newValues: {
        name: reward.name,
        costPoints: reward.costPoints,
        isActive: reward.isActive,
      },
    });

    return reward;
  }

  async admin_updateReward(id: string, data: any, requesterId = 'SYSTEM') {
    const old = await this.prisma.pointReward.findUnique({
      where: { id },
      select: { name: true, isActive: true },
    });
    const updated = await this.prisma.pointReward.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        costPoints: data.costPoints,
        type: data.type,
        config: data.config,
        isActive: data.isActive,
      },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'gamification.reward.update',
      entity: 'PointReward',
      entityId: id,
      description: `Updated reward: ${old?.name || id}`,
      oldValues: { name: old?.name, isActive: old?.isActive },
      newValues: { name: updated.name, isActive: updated.isActive },
    });

    return updated;
  }

  async admin_deleteReward(id: string, requesterId = 'SYSTEM') {
    const reward = await this.prisma.pointReward.findUnique({ where: { id } });
    const result = await this.prisma.pointReward.delete({
      where: { id },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'gamification.reward.delete',
      entity: 'PointReward',
      entityId: id,
      description: `Deleted reward: ${reward?.name || id}`,
      metadata: { name: reward?.name },
    });

    return result;
  }

  // activity-heatmap removed (DailyActivity removed)
}
