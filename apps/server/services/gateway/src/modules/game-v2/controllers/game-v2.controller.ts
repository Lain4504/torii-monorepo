import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  Query,
  Req,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ReqWithRequester, GatewayAuthGuard, PrismaService, errorResponse, successResponse } from '@server/shared';
import { GamificationCurrency, GamificationTransactionType } from '@prisma/generated';

@Controller('api/v2/game')
@UseGuards(GatewayAuthGuard)
export class GameV2Controller {
  private readonly logger = new Logger(GameV2Controller.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService & Record<string, any>,
    @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
  ) {}

  private vnDateStr(d: Date = new Date()) {
    const vn = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    const y = vn.getFullYear();
    const m = String(vn.getMonth() + 1).padStart(2, '0');
    const day = String(vn.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private addDaysUTCLikeVN(d: Date, days: number) {
    const vn = new Date(d.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    vn.setDate(vn.getDate() + days);
    return vn;
  }

  @Get('profile')
  async getProfile(@Req() req: ReqWithRequester) {
    try {
      const userId = req.requester.sub;
      const now = new Date();
      const todayStr = this.vnDateStr(now);

      const profile = await this.prisma.gameProfile.upsert({
        where: { userId },
        update: {},
        create: {
          userId,
          level: 1,
          currentXp: 0,
          totalXp: 0,
          points: 0,
          currentStreak: 0,
          longestStreak: 0,
          freezeCount: 0,
          totalActiveDays: 0,
          lastToastShownDate: null,
        },
      });

      // Derive last active date from streak logs (ACTIVE/FREEZE are both "active").
      const lastLog = await this.prisma.gameStreakLog.findFirst({
        where: { userId, status: { in: ['ACTIVE', 'FREEZE'] } },
        orderBy: { date: 'desc' },
        select: { date: true },
      });
      const lastActiveDate = lastLog?.date ?? null;

      const vnToday = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
      const start7 = this.addDaysUTCLikeVN(vnToday, -6);
      const start30 = this.addDaysUTCLikeVN(vnToday, -29);
      const start7Str = this.vnDateStr(start7);
      const start30Str = this.vnDateStr(start30);

      const weeklyActiveCount = await this.prisma.gameStreakLog.count({
        where: { userId, status: 'ACTIVE', date: { gte: start7Str, lte: todayStr } },
      });
      const monthlyActiveCount = await this.prisma.gameStreakLog.count({
        where: { userId, status: 'ACTIVE', date: { gte: start30Str, lte: todayStr } },
      });

      return successResponse({
        id: profile.id,
        userId: profile.userId,
        level: profile.level,
        currentXp: profile.currentXp,
        totalXp: profile.totalXp,
        points: profile.points,
        gems: 0,
        balance: 0,
        currentStreak: profile.currentStreak,
        longestStreak: profile.longestStreak,
        lastActiveDate,
        freezeCount: profile.freezeCount,
        totalActiveDays: profile.totalActiveDays,
        weeklyActiveCount,
        monthlyActiveCount,
        updatedAt: now.toISOString(),
      });
    } catch (e: unknown) {
      const err = e as Error;
      this.logger.error(`getProfile failed: ${err.message}`);
      return errorResponse(err.message || 'Failed to fetch profile');
    }
  }

  @Get('streak')
  async getStreak(@Req() req: ReqWithRequester) {
    try {
      const userId = req.requester.sub;
      const now = new Date();
      const todayStr = this.vnDateStr(now);
      const yesterdayStr = this.vnDateStr(this.addDaysUTCLikeVN(now, -1));

      const profile = await this.prisma.gameProfile.upsert({
        where: { userId },
        update: {},
        create: {
          userId,
          level: 1,
          currentXp: 0,
          totalXp: 0,
          points: 0,
          currentStreak: 0,
          longestStreak: 0,
          freezeCount: 0,
          totalActiveDays: 0,
          lastToastShownDate: null,
        },
      });

      const todayActiveLog = await this.prisma.gameStreakLog.findFirst({
        where: { userId, date: todayStr, status: 'ACTIVE' },
        select: { id: true },
      });
      const isActiveToday = !!todayActiveLog;

      const hadFreezeYesterday = await this.prisma.gameStreakLog.findFirst({
        where: { userId, date: yesterdayStr, status: 'FREEZE' },
        select: { id: true },
      });
      const streakSavedByFreeze = isActiveToday && !!hadFreezeYesterday;

      const lastLog = await this.prisma.gameStreakLog.findFirst({
        where: { userId, status: { in: ['ACTIVE', 'FREEZE'] } },
        orderBy: { date: 'desc' },
        select: { date: true },
      });
      const lastActiveDate = lastLog?.date ?? null;

      const vnToday = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
      const start30 = this.addDaysUTCLikeVN(vnToday, -29);
      const start30Str = this.vnDateStr(start30);

      const recentActiveLogs = await this.prisma.gameStreakLog.findMany({
        where: { userId, status: 'ACTIVE', date: { gte: start30Str, lte: todayStr } },
        select: { date: true },
        orderBy: { date: 'desc' },
        take: 60,
      });
      const recentFreezeLogs = await this.prisma.gameStreakLog.findMany({
        where: { userId, status: 'FREEZE', date: { gte: start30Str, lte: todayStr } },
        select: { date: true },
        orderBy: { date: 'desc' },
        take: 60,
      });

      const recentActiveDates = recentActiveLogs.map((l) => l.date);
      const recentFreezeDates = recentFreezeLogs.map((l) => l.date);

      const weeklyActiveCount = await this.prisma.gameStreakLog.count({
        where: {
          userId,
          status: 'ACTIVE',
          date: { gte: this.vnDateStr(this.addDaysUTCLikeVN(now, -6)), lte: todayStr },
        },
      });
      const monthlyActiveCount = await this.prisma.gameStreakLog.count({
        where: {
          userId,
          status: 'ACTIVE',
          date: { gte: start30Str, lte: todayStr },
        },
      });

      // One/day gating (cross-device).
      const shouldShowToast = profile.lastToastShownDate !== todayStr;
      const willBreakTomorrow = isActiveToday && (profile.currentStreak ?? 0) > 0;

      return successResponse({
        currentStreak: profile.currentStreak,
        longestStreak: profile.longestStreak,
        freezeCount: profile.freezeCount,
        streakSavedByFreeze,
        isActiveToday,
        willBreakTomorrow,
        lastActiveDate,
        totalActiveDays: profile.totalActiveDays,
        weeklyActiveCount,
        monthlyActiveCount,
        recentActiveDates,
        recentFreezeDates,
        shouldShowToast,
      });
    } catch (e: unknown) {
      const err = e as Error;
      this.logger.error(`getStreak failed: ${err.message}`);
      return errorResponse(err.message || 'Failed to fetch streak');
    }
  }

  @Post('mark-toast-shown')
  async markToastShown(@Req() req: ReqWithRequester) {
    try {
      const userId = req.requester.sub;
      const todayStr = this.vnDateStr(new Date());

      await this.prisma.gameProfile.update({
        where: { userId },
        data: { lastToastShownDate: todayStr, updatedAt: new Date() },
      }).catch(async () => {
        await this.prisma.gameProfile.upsert({
          where: { userId },
          update: { lastToastShownDate: todayStr, updatedAt: new Date() },
          create: {
            userId,
            level: 1,
            currentXp: 0,
            totalXp: 0,
            points: 0,
            currentStreak: 0,
            longestStreak: 0,
            freezeCount: 0,
            totalActiveDays: 0,
            lastToastShownDate: todayStr,
          },
        });
      });

      return successResponse({ ok: true });
    } catch (e: unknown) {
      const err = e as Error;
      this.logger.error(`markToastShown failed: ${err.message}`);
      return errorResponse(err.message || 'Failed to mark toast shown');
    }
  }

  @Get('daily-missions')
  async getDailyMissions(@Req() req: ReqWithRequester) {
    try {
      return successResponse({
        missions: [],
      });
    } catch (e: unknown) {
      const err = e as Error;
      this.logger.error(`getDailyMissions failed: ${err.message}`);
      return errorResponse(err.message || 'Failed to fetch daily missions');
    }
  }

  @Post('missions/:missionId/claim')
  async claimMission(
    @Req() req: ReqWithRequester,
    @Param('missionId') missionId: string,
    @Body() body: any,
  ) {
    try {
      return successResponse({
        missionId,
        claimed: true,
        rewards: [],
      });
    } catch (e: unknown) {
      const err = e as Error;
      this.logger.error(`claimMission failed: ${err.message}`);
      return errorResponse(err.message || 'Failed to claim mission');
    }
  }

  @Get('leaderboard')
  async getLeaderboard(
    @Req() req: ReqWithRequester,
    @Query('type') type?: string,
  ) {
    try {
      // MVP: leaderboard for the current week based on game_ledger_entries XP.
      const userId = req.requester.sub;
      const now = new Date();

      // Compute week range (Monday -> Sunday) using UTC to avoid timezone drift.
      const weekStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const day = weekStart.getUTCDay(); // 0=Sun, 1=Mon, ...
      const diffToMonday = (day + 6) % 7;
      weekStart.setUTCDate(weekStart.getUTCDate() - diffToMonday);
      weekStart.setUTCHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setUTCDate(weekEnd.getUTCDate() + 7);

      // Only count valid learning outputs (exclude daily login)
      const validSourceTypes: string[] = [
        'VOD_LESSON_COMPLETED',
        'LIVE_SESSION_ATTENDED',
        'SRS_REVIEW_COMPLETED',
        'JLPT_MOCK_SUBMITTED',
        'AI_PRACTICE_COMPLETED',
      ];

      const grouped = await this.prisma.gameLedgerEntry.groupBy({
        by: ['userId'],
        _sum: { amount: true },
        where: {
          currency: GamificationCurrency.XP,
          type: GamificationTransactionType.EARN,
          sourceType: { in: validSourceTypes },
          createdAt: { gte: weekStart, lt: weekEnd },
        },
      });

      const totals = grouped.map((g) => ({
        userId: g.userId,
        xp: Math.trunc(g._sum.amount ?? 0),
      }));

      totals.sort((a, b) => b.xp - a.xp);

      const topN = 50;
      const top = totals.slice(0, topN);

      const topUserIds: string[] = Array.from(
        new Set(top.map((x) => x.userId as string)),
      );

      const prisma: any = this.prisma as any;

      const users = await prisma.user.findMany({
        where: { id: { in: topUserIds } },
        select: { id: true, displayName: true, avatarUrl: true },
      });
      const userById = new Map(users.map((u) => [u.id, u]));

      const profiles = await prisma.gameProfile.findMany({
        where: { userId: { in: topUserIds } },
        select: {
          userId: true,
          level: true,
          currentStreak: true,
          totalActiveDays: true,
        },
      });
      const profileById = new Map(profiles.map((p) => [p.userId, p]));

      const usersResponse = top.map((t, idx) => {
        const u: any = userById.get(t.userId);
        const p: any = profileById.get(t.userId);
        return {
          id: t.userId,
          displayName: u?.displayName ?? 'User',
          avatarUrl: u?.avatarUrl ?? null,
          xp: t.xp,
          level: p?.level ?? 1,
          rank: idx + 1,
          currentStreak: p?.currentStreak ?? 0,
          totalActiveDays: p?.totalActiveDays ?? 0,
        };
      });

      const currentXpRow = totals.find((t) => t.userId === userId);
      const currentRank = currentXpRow
        ? totals
            .map((t) => t.userId)
            .indexOf(userId) + 1
        : null;

      const currentUserProfile = await prisma.gameProfile.findUnique({
        where: { userId },
        select: { userId: true, level: true, currentStreak: true, totalActiveDays: true },
      });
      const currentUserEntity = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, displayName: true, avatarUrl: true },
      });

      const currentUser = currentXpRow
        ? {
            id: userId,
            displayName: currentUserEntity?.displayName ?? 'User',
            avatarUrl: currentUserEntity?.avatarUrl ?? null,
            xp: currentXpRow.xp,
            level: currentUserProfile?.level ?? 1,
            rank: currentRank ?? 0,
            currentStreak: currentUserProfile?.currentStreak ?? 0,
            totalActiveDays: currentUserProfile?.totalActiveDays ?? 0,
          }
        : {
            id: userId,
            displayName: currentUserEntity?.displayName ?? 'User',
            avatarUrl: currentUserEntity?.avatarUrl ?? null,
            xp: 0,
            level: currentUserProfile?.level ?? 1,
            rank: 0,
            currentStreak: currentUserProfile?.currentStreak ?? 0,
            totalActiveDays: currentUserProfile?.totalActiveDays ?? 0,
          };

      return successResponse({
        type: (type as any) || 'global',
        totalUsers: totals.length,
        users: usersResponse,
        currentUser,
      });
    } catch (e: unknown) {
      const err = e as Error;
      this.logger.error(`getLeaderboard failed: ${err.message}`);
      return errorResponse(err.message || 'Failed to fetch leaderboard');
    }
  }

  @Get('achievements')
  async getAchievements(@Req() req: ReqWithRequester) {
    try {
      const userId = req.requester.sub;
      const now = new Date();
      const prisma: any = this.prisma as any;

      const profile = await prisma.gameProfile.upsert({
        where: { userId },
        update: {},
        create: {
          userId,
          level: 1,
          currentXp: 0,
          totalXp: 0,
          points: 0,
          currentStreak: 0,
          longestStreak: 0,
          freezeCount: 0,
          totalActiveDays: 0,
        },
      });

      const defaultAchievements = [
        {
          code: 'STREAK_3',
          tier: 'bronze',
          category: 'STREAK',
          title: 'Chuỗi 3 ngày',
          description: 'Đạt chuỗi học liên tiếp 3 ngày.',
          requirements: { type: 'currentStreak', value: 3 },
          rewards: { points: 50 },
        },
        {
          code: 'TOTAL_ACTIVE_DAYS_10',
          tier: 'silver',
          category: 'CONSISTENCY',
          title: '10 ngày tích cực',
          description: 'Tích lũy 10 ngày học chủ động.',
          requirements: { type: 'totalActiveDays', value: 10 },
          rewards: { points: 100 },
        },
        {
          code: 'LEVEL_5',
          tier: 'gold',
          category: 'MASTERY',
          title: 'Đạt level 5',
          description: 'Lên cấp độ 5 trở lên.',
          requirements: { type: 'level', value: 5 },
          rewards: { points: 150 },
        },
      ];

      const achievements = await Promise.all(
        defaultAchievements.map((a) =>
          prisma.gameAchievement.upsert({
            where: { code: a.code },
            update: {
              tier: a.tier,
              category: a.category,
              title: a.title,
              description: a.description,
              requirements: a.requirements as any,
              rewards: a.rewards as any,
              isActive: true,
            },
            create: {
              code: a.code,
              tier: a.tier,
              category: a.category,
              title: a.title,
              description: a.description,
              requirements: a.requirements as any,
              rewards: a.rewards as any,
              isActive: true,
            },
          }),
        ),
      );

      const achievementById = new Map(achievements.map((a) => [a.id, a]));

      const userAchievements = await prisma.gameUserAchievement.findMany(
        {
          where: {
            userId,
            achievementId: { in: achievements.map((a) => a.id) },
          },
        },
      );

      const userAchievementByAchId = new Map(
        userAchievements.map((ua) => [ua.achievementId, ua]),
      );

      const unlockPlan = achievements.map((a) => {
        const code = a.code;
        let shouldUnlock = false;
        if (code === 'STREAK_3') shouldUnlock = (profile.currentStreak ?? 0) >= 3;
        if (code === 'TOTAL_ACTIVE_DAYS_10')
          shouldUnlock = (profile.totalActiveDays ?? 0) >= 10;
        if (code === 'LEVEL_5') shouldUnlock = (profile.level ?? 1) >= 5;

        return {
          achievement: a,
          shouldUnlock,
          ua: (userAchievementByAchId.get(a.id) ?? null) as any,
        };
      });

      await prisma.$transaction(async (tx: any) => {
        for (const item of unlockPlan) {
          const ach = item.achievement;
          if (!item.shouldUnlock) continue;

          const ua = item.ua;
          const alreadyUnlocked = ua?.isUnlocked;
          if (alreadyUnlocked) continue;

          const pointsToAward = (ach.rewards as any)?.points
            ? Number((ach.rewards as any).points)
            : 0;
          const idempotencyKey = `ach_unlock:${userId}:${ach.code}`;
          const sourceRefKey = `achievement:${ach.code}`;

          const ledgerExists = await tx.gameLedgerEntry.findFirst({
            where: { userId, idempotencyKey, sourceRefKey },
          });

          await tx.gameUserAchievement.upsert({
            where: { userId_achievementId: { userId, achievementId: ach.id } },
            update: { isUnlocked: true, unlockedAt: now, progress: {} as any },
            create: {
              userId,
              achievementId: ach.id,
              isUnlocked: true,
              unlockedAt: now,
              progress: {} as any,
            },
          });

          if (pointsToAward > 0 && !ledgerExists) {
            await tx.gameLedgerEntry.create({
              data: {
                userId,
                amount: pointsToAward,
                currency: GamificationCurrency.POINT,
                type: GamificationTransactionType.EARN,
                reasonCode: 'ACHIEVEMENT_UNLOCKED',
                sourceType: 'ACHIEVEMENT',
                sourceRefKey,
                idempotencyKey,
                metadata: {
                  achievementId: ach.id,
                  achievementCode: ach.code,
                  source: 'ACHIEVEMENT_UNLOCK',
                  dateString: now.toISOString(),
                } as any,
              },
            });

            await tx.gameProfile.update({
              where: { userId },
              data: { points: { increment: pointsToAward } },
            });
          }
        }
      });

      const refreshedUserAchievements = await prisma.gameUserAchievement.findMany({
        where: { userId, achievementId: { in: achievements.map((a) => a.id) } },
      });
      const refreshedByAchId = new Map(
        refreshedUserAchievements.map((ua) => [ua.achievementId, ua]),
      );

      const achievementsResponse = achievements
        .slice()
        // stable order
        .sort((a, b) => a.code.localeCompare(b.code))
        .map((a) => {
          const ua: any = refreshedByAchId.get(a.id);
          return {
            id: ua?.id ?? '',
            achievementId: a.id,
            isUnlocked: ua?.isUnlocked ?? false,
            progress: ua?.progress ?? null,
            unlockedAt: ua?.unlockedAt ? ua.unlockedAt.toISOString() : null,
            achievement: {
              id: a.id,
              code: a.code,
              category: a.category,
              title: a.title,
              description: a.description ?? '',
              icon: null,
              requirements: (a.requirements ?? {}) as any,
              rewards: (a.rewards ?? {}) as any,
              isActive: a.isActive,
              orderIndex: 0,
            },
          };
        });

      return successResponse({ achievements: achievementsResponse });
    } catch (e: unknown) {
      const err = e as Error;
      this.logger.error(`getAchievements failed: ${err.message}`);
      return errorResponse(err.message || 'Failed to fetch achievements');
    }
  }

  @Get('ledger')
  async getLedger(
    @Req() req: ReqWithRequester,
    @Query('limit') limit?: string,
  ) {
    try {
      const userId = req.requester.sub;
      const take = Math.max(1, Number(limit) || 50);

      const entries = await this.prisma.gameLedgerEntry.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take,
      });

      return successResponse({
        entries: entries.map((e) => ({
          id: e.id,
          userId: e.userId,
          amount: e.amount,
          currency: e.currency,
          type: e.type,
          reasonCode: e.reasonCode,
          sourceType: e.sourceType,
          sourceRefKey: e.sourceRefKey,
          idempotencyKey: e.idempotencyKey,
          metadata: e.metadata,
          createdAt: e.createdAt,
        })),
        limit: take,
      });
    } catch (e: unknown) {
      const err = e as Error;
      this.logger.error(`getLedger failed: ${err.message}`);
      return errorResponse(err.message || 'Failed to fetch ledger');
    }
  }

  @Get('coupon-rewards')
  async getCouponRewards(@Req() req: ReqWithRequester) {
    try {
      const prisma: any = this.prisma as any;

      // Nếu GV2 chưa có dữ liệu reward (chưa seed migration), fallback seed từ legacy
      // `pointReward` để đảm bảo FE hoạt động end-to-end.
      const existingCount = await prisma.gameCouponReward.count({
        where: { isActive: true },
      });

      if (existingCount === 0 && prisma.pointReward) {
        const legacyRewards = await prisma.pointReward.findMany({
          where: { isActive: true },
          orderBy: { costPoints: 'asc' },
        });

        for (const lr of legacyRewards) {
          const cfg: any = (lr.config ?? {}) as any;

          const code = `LEGACY_${lr.id}`;
          const discountType = cfg.discountType ?? 'FIXED_AMOUNT';
          const discountValue = cfg.discountValue ?? 0;
          const maxDiscountAmount = cfg.maxDiscountAmount ?? null;
          const minOrderValue = cfg.minOrderValue ?? null;
          const expiresInDays = cfg.validDays ?? cfg.expiresInDays ?? 30;

          await prisma.gameCouponReward.upsert({
            where: { code },
            update: {
              title: lr.name,
              description: lr.description,
              costPoints: lr.costPoints,
              discountType,
              discountValue,
              maxDiscountAmount,
              minOrderValue,
              expiresInDays,
              isActive: lr.isActive,
            },
            create: {
              code,
              title: lr.name,
              description: lr.description,
              costPoints: lr.costPoints,
              discountType,
              discountValue,
              maxDiscountAmount,
              minOrderValue,
              expiresInDays,
              isActive: lr.isActive,
            },
          });
        }
      }

      const rewards = await prisma.gameCouponReward.findMany({
        where: { isActive: true },
        orderBy: { costPoints: 'asc' },
      });

      return successResponse(
        rewards.map((r) => ({
          id: r.id,
          name: r.title,
          description: r.description,
          costPoints: r.costPoints,
          type: 'COUPON',
          isActive: r.isActive,
          config: {
            discountType: r.discountType,
            discountValue: Number((r.discountValue as any)?.toString?.() ?? r.discountValue),
            maxDiscountAmount: r.maxDiscountAmount != null
              ? Number((r.maxDiscountAmount as any)?.toString?.() ?? r.maxDiscountAmount)
              : null,
            minOrderValue: r.minOrderValue != null
              ? Number((r.minOrderValue as any)?.toString?.() ?? r.minOrderValue)
              : null,
            validDays: r.expiresInDays,
          },
        })),
      );
    } catch (e: unknown) {
      const err = e as Error;
      this.logger.error(`getCouponRewards failed: ${err.message}`);
      return errorResponse(err.message || 'Failed to fetch coupon rewards');
    }
  }

  @Post('coupon-rewards/:rewardId/redeem')
  async redeemCouponReward(
    @Req() req: ReqWithRequester,
    @Param('rewardId') rewardId: string,
    @Body() body: any,
  ) {
    try {
      const prisma: any = this.prisma as any;
      const userId = req.requester.sub;
      const reward = await prisma.gameCouponReward.findUnique({
        where: { id: rewardId },
      });

      if (!reward || !reward.isActive) {
        return errorResponse('Coupon reward not found or inactive');
      }

      const idempotencyKey =
        body?.idempotencyKey ??
        `coupon_redeem:${userId}:${rewardId}`;
      const sourceRefKey = rewardId;

      const existingRedemption = await prisma.gameCouponRedemption.findFirst(
        {
          where: { userId, idempotencyKey },
          orderBy: { createdAt: 'desc' },
        },
      );

      if (existingRedemption?.status === 'USED') {
        return successResponse({
          rewardId,
          redeemed: true,
          redemption: existingRedemption,
          couponCode: existingRedemption.couponCode,
        });
      }

      const now = new Date();

      const redemption = await this.prisma.$transaction(async (tx: any) => {
        // Create or re-use profile
        await tx.gameProfile.upsert({
          where: { userId },
          update: {},
          create: {
            userId,
            level: 1,
            currentXp: 0,
            totalXp: 0,
            points: 0,
            currentStreak: 0,
            longestStreak: 0,
            freezeCount: 0,
            totalActiveDays: 0,
            lastToastShownDate: null,
          },
        });

        const profile = await tx.gameProfile.findUnique({
          where: { userId },
          select: { userId: true, points: true },
        });

        if ((profile?.points ?? 0) < reward.costPoints) {
          throw new Error('NOT_ENOUGH_POINTS');
        }

        // Idempotency: ensure points decrement + ledger happen only once.
        // Double-check idempotency inside transaction.
        const currentRedemption = await tx.gameCouponRedemption.findFirst({
          where: { userId, idempotencyKey },
          orderBy: { createdAt: 'desc' },
        });
        if (currentRedemption?.status === 'USED') {
          return currentRedemption;
        }

        const ledgerExists = await tx.gameLedgerEntry.findFirst({
          where: { userId, idempotencyKey, sourceRefKey },
        });

        let ledgerEntryId: string | null = ledgerExists?.id ?? null;
        if (!ledgerExists) {
          const ledgerEntry = await tx.gameLedgerEntry.create({
            data: {
              userId,
              amount: -Math.abs(reward.costPoints),
              currency: GamificationCurrency.POINT,
              type: GamificationTransactionType.REDEEM,
              reasonCode: 'COUPON_REDEEM',
              sourceType: 'COUPON_REWARD',
              sourceRefKey,
              idempotencyKey,
              metadata: {
                rewardId,
                rewardCode: reward.code,
                costPoints: reward.costPoints,
                source: 'COUPON_REDEEM',
                version: 2,
              } as any,
            },
          });
          ledgerEntryId = ledgerEntry.id;

          // Only deduct points when we create the ledger entry.
          await tx.gameProfile.update({
            where: { userId },
            data: { points: { decrement: reward.costPoints } },
          });
        }

        // Create a real personal coupon for the user (for FE rewards page).
        const prefix = (reward.code ?? 'RWD').toString().slice(0, 3).toUpperCase();
        const generatedCode = `${prefix}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const expiresInDays = reward.expiresInDays ?? 30;

        const couponEndDate =
          reward.expiresInDays != null ? new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000) : null;

        const coupon = await tx.coupon.create({
          data: {
            code: generatedCode,
            name: reward.title,
            description: reward.description ?? `Mã giảm giá từ: ${reward.title}`,
            discountType: reward.discountType as any,
            discountValue: reward.discountValue as any,
            maxDiscountAmount: reward.maxDiscountAmount as any,
            minOrderValue: reward.minOrderValue as any,
            usageLimit: 1,
            perUserLimit: 1,
            startDate: now,
            endDate: couponEndDate,
            status: 'ACTIVE' as any,
            scope: 'GLOBAL' as any,
            ownerId: userId,
            source: 'GAMIFICATION_REWARD',
            metadata: {
              rewardId: reward.id,
              rewardCode: reward.code,
              version: 2,
            } as any,
          },
        });

        return tx.gameCouponRedemption.create({
          data: {
            userId,
            rewardId: reward.id,
            ledgerEntryId,
            couponId: coupon.id,
            couponCode: coupon.code,
            costPoints: reward.costPoints,
            status: 'USED',
            redeemedAt: now,
            usedAt: now,
            idempotencyKey,
            metadata: {
              rewardId,
              rewardCode: reward.code,
              costPoints: reward.costPoints,
              version: 2,
            } as any,
          },
        });
      });

      return successResponse({
        rewardId,
        redeemed: true,
        redemption,
        couponCode: redemption.couponCode,
      });
    } catch (e: unknown) {
      const err = e as Error;
      this.logger.error(`redeemCouponReward failed: ${err.message}`);
      if (err.message === 'NOT_ENOUGH_POINTS') {
        return errorResponse('NOT_ENOUGH_POINTS');
      }
      return errorResponse(err.message || 'Failed to redeem coupon');
    }
  }

  @Get('history')
  async getHistory(
    @Req() req: ReqWithRequester,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    try {
      const prisma: any = this.prisma as any;
      const userId = req.requester.sub;
      const take = Math.max(1, Number(limit) || 20);
      const skip = Math.max(0, Number(offset) || 0);

      const validSourceTypes: string[] = [
        'VOD_LESSON_COMPLETED',
        'LIVE_SESSION_ATTENDED',
        'SRS_REVIEW_COMPLETED',
        'JLPT_MOCK_SUBMITTED',
        'AI_PRACTICE_COMPLETED',
      ];

      const entries = await prisma.gameLedgerEntry.findMany({
        where: {
          userId,
          type: GamificationTransactionType.EARN,
          currency: GamificationCurrency.XP,
          sourceType: { in: validSourceTypes },
        },
        orderBy: { createdAt: 'desc' },
        take,
        skip,
      });

      const items = entries.map((e) => {
        const md: any = (e.metadata ?? {}) as any;
        const lessonId = md.lessonId ?? md.reviewId ?? md.cardId ?? null;
        const classId = md.classId ?? null;
        const courseTitle = md.courseTitle ?? null;
        const title =
          md.title ?? md.description ?? md.lessonTitle ?? e.reasonCode ?? 'Bài học';

        return {
          id: e.id,
          userId: e.userId,
          metadata: { classId, lessonId, courseTitle },
          description: title,
          createdAt: e.createdAt,
        };
      });

      return successResponse({ items });
    } catch (e: unknown) {
      const err = e as Error;
      this.logger.error(`getHistory failed: ${err.message}`);
      return errorResponse(err.message || 'Failed to fetch history');
    }
  }

  @Post('ingest-activity')
  async ingestActivity(@Req() req: ReqWithRequester, @Body() body: any) {
    try {
      if (!body?.activityType) {
        throw new BadRequestException('activityType is required');
      }

      const result = await firstValueFrom(
        this.natsClient.send('internal.game.ingest-activity', {
          userId: req.requester.sub,
          activityType: body.activityType,
          meta: body.meta ?? {},
          eventTime: new Date().toISOString(),
        }),
      );

      return successResponse({
        activityType: body.activityType,
        xpGained: result?.xpAward ?? 0,
        pointsGained: result?.pointsAward ?? 0,
        streakUpdated: result?.streakUpdated ?? false,
        date: result?.date,
        idempotent: result?.idempotent ?? false,
      });
    } catch (e: unknown) {
      const err = e as Error;
      this.logger.error(`ingestActivity failed: ${err.message}`);
      return errorResponse(err.message || 'Failed to ingest activity');
    }
  }
}

