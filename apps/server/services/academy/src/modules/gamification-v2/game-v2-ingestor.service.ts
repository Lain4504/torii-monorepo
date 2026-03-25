import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import {
  GamificationCurrency,
  GamificationTransactionType,
  ActivityType,
} from '@prisma/generated';

type V2ActivityKey =
  | 'VOD_LESSON_COMPLETED'
  | 'LIVE_SESSION_ATTENDED'
  | 'SRS_REVIEW_COMPLETED'
  | 'JLPT_MOCK_SUBMITTED'
  | 'AI_PRACTICE_COMPLETED'
  | 'DAILY_LOGIN';

@Injectable()
export class GameV2IngestorService {
  private readonly logger = new Logger(GameV2IngestorService.name);

  private readonly XP_PER_LEVEL = 1000;

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

  private getYesterdayStr(todayStr: string) {
    const today = new Date(`${todayStr}T00:00:00.000Z`);
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    // Convert back to VN date string for consistency with stored format.
    return this.getVnDateString(yesterday);
  }

  private stableStringify(v: any) {
    try {
      if (v === null || v === undefined) return '';
      if (typeof v !== 'object') return String(v);
      return JSON.stringify(v, Object.keys(v).sort());
    } catch {
      return String(v);
    }
  }

  private smallHash(input: string) {
    // Simple non-crypto hash for dedup key length.
    let h = 5381;
    for (let i = 0; i < input.length; i++) {
      h = (h * 33) ^ input.charCodeAt(i);
    }
    return Math.abs(h).toString(16);
  }

  private mapActivity(activityType: string): {
    v2Key: V2ActivityKey;
    isValidForStreak: boolean;
  } {
    switch (activityType as ActivityType) {
      case ActivityType.LOGIN:
        return { v2Key: 'DAILY_LOGIN', isValidForStreak: false };
      case ActivityType.REVIEW:
      case ActivityType.FLASHCARD_REVIEW:
        return { v2Key: 'SRS_REVIEW_COMPLETED', isValidForStreak: true };
      case ActivityType.EXAM_COMPLETE:
        return { v2Key: 'JLPT_MOCK_SUBMITTED', isValidForStreak: true };
      case ActivityType.PRACTICE:
        return { v2Key: 'AI_PRACTICE_COMPLETED', isValidForStreak: true };
      case ActivityType.LESSON_COMPLETE:
      case ActivityType.VIDEO_WATCH:
        return { v2Key: 'VOD_LESSON_COMPLETED', isValidForStreak: true };
      case ActivityType.QUIZ_ANSWER:
        // Treat quiz as a learning output; no dedicated v2 sourceType yet.
        return { v2Key: 'JLPT_MOCK_SUBMITTED', isValidForStreak: true };
      default:
        return { v2Key: 'DAILY_LOGIN', isValidForStreak: false };
    }
  }

  private computeSourceRefKey(meta: any): string {
    if (!meta || typeof meta !== 'object') return `unknown:${this.smallHash(String(meta))}`;

    if (meta.lessonId) return `lesson:${meta.lessonId}`;
    if (meta.reviewId) return `review:${meta.reviewId}`;
    if (meta.cardId) return `card:${meta.cardId}`;
    if (meta.studySetId && meta.cardId)
      return `card:${meta.studySetId}:${meta.cardId}`;

    if (meta.sessionId) return `session:${meta.sessionId}`;
    if (meta.attemptId) return `attempt:${meta.attemptId}`;
    if (meta.examAttemptId) return `examAttempt:${meta.examAttemptId}`;

    const compact = this.stableStringify(meta);
    return `meta:${this.smallHash(compact)}`;
  }

  private computeAward(activityType: string, v2Key: V2ActivityKey, meta: any) {
    // MVP: reuse v1 baseline rules roughly.
    switch (activityType as ActivityType) {
      case ActivityType.REVIEW:
        return { xp: 5, points: 1 };
      case ActivityType.FLASHCARD_REVIEW:
        return { xp: 5, points: 1 };
      case ActivityType.EXAM_COMPLETE:
        return { xp: 150, points: 10 };
      case ActivityType.PRACTICE:
        return { xp: 2, points: 0 };
      case ActivityType.LESSON_COMPLETE:
      case ActivityType.VIDEO_WATCH:
        return { xp: 20, points: 2 };
      case ActivityType.QUIZ_ANSWER:
        return { xp: 1, points: 0 };
      case ActivityType.LOGIN:
        return { xp: 10, points: 5 };
      default:
        return { xp: 0, points: 0 };
    }
  }

  private readonly XP_DAILY_CAP: Partial<Record<ActivityType, number>> = {
    [ActivityType.QUIZ_ANSWER]: 20,
    [ActivityType.FLASHCARD_REVIEW]: 15,
    [ActivityType.PRACTICE]: 10,
  };

  private readonly POINTS_DAILY_CAP: Partial<Record<ActivityType, number>> = {
    [ActivityType.LOGIN]: 5,
    [ActivityType.LESSON_COMPLETE]: 20,
    [ActivityType.EXAM_COMPLETE]: 30,
    [ActivityType.FLASHCARD_REVIEW]: 10,
    [ActivityType.REVIEW]: 10,
  };

  constructor(private readonly prisma: PrismaService) {}

  async ingestActivity(params: {
    userId: string;
    activityType: string;
    meta?: Record<string, unknown>;
    eventTime?: string;
  }) {
    const { userId, activityType, meta = {}, eventTime } = params;

    const eventDate = eventTime ? new Date(eventTime) : new Date();
    const dateString = this.getVnDateString(eventDate);

    const { v2Key, isValidForStreak } = this.mapActivity(activityType);
    const sourceRefKey = this.computeSourceRefKey(meta);
    const idempotencyKey = `${activityType}:${v2Key}:${dateString}:${this.smallHash(sourceRefKey)}`;

    const now = new Date();

    // Award and streak are in the same transaction for consistency.
    return this.prisma.$transaction(async (tx) => {
      // Ensure profile exists
      await tx.gameProfile.upsert({
        where: { userId },
        update: {},
        create: { userId, level: 1, currentXp: 0, totalXp: 0, points: 0, currentStreak: 0, longestStreak: 0, freezeCount: 0, totalActiveDays: 0 },
      });

      // --- Ledger idempotency (award) ---
      const existingLedger = await tx.gameLedgerEntry.findFirst({
        where: {
          userId,
          idempotencyKey,
          sourceRefKey,
        },
      });

      const { xp: rawXp, points: rawPoints } = this.computeAward(
        activityType,
        v2Key,
        meta,
      );

      let xpAward = existingLedger ? 0 : rawXp;
      let pointsAward = existingLedger ? 0 : rawPoints;

      // Daily cap (MVP)
      if (!existingLedger && xpAward > 0) {
        const cap = this.XP_DAILY_CAP[activityType as ActivityType];
        if (cap != null) {
          const start = new Date(`${dateString}T00:00:00.000Z`);
          const end = new Date(`${dateString}T23:59:59.999Z`);
          const s = await tx.gameLedgerEntry.aggregate({
            where: {
              userId,
              currency: GamificationCurrency.XP,
              type: GamificationTransactionType.EARN,
              sourceType: v2Key,
              createdAt: { gte: start, lte: end },
            },
            _sum: { amount: true },
          });
          const used = s._sum.amount ?? 0;
          xpAward = Math.max(0, Math.min(xpAward, cap - used));
        }
      }

      if (!existingLedger && pointsAward > 0) {
        const cap = this.POINTS_DAILY_CAP[activityType as ActivityType];
        if (cap != null) {
          const start = new Date(`${dateString}T00:00:00.000Z`);
          const end = new Date(`${dateString}T23:59:59.999Z`);
          const s = await tx.gameLedgerEntry.aggregate({
            where: {
              userId,
              currency: GamificationCurrency.POINT,
              type: GamificationTransactionType.EARN,
              sourceType: v2Key,
              createdAt: { gte: start, lte: end },
            },
            _sum: { amount: true },
          });
          const used = s._sum.amount ?? 0;
          pointsAward = Math.max(0, Math.min(pointsAward, cap - used));
        }
      }

      if (!existingLedger) {
        if (pointsAward > 0) {
          await tx.gameLedgerEntry.create({
            data: {
              userId,
              amount: pointsAward,
              currency: GamificationCurrency.POINT,
              type: GamificationTransactionType.EARN,
              reasonCode: v2Key,
              sourceType: v2Key,
              sourceRefKey,
              idempotencyKey,
              metadata: {
                ...meta,
                dateString,
                activityType,
                source: 'INGEST_ACTIVITY',
                version: 2,
              } as any,
            },
          });
        }

        if (xpAward > 0) {
          await tx.gameLedgerEntry.create({
            data: {
              userId,
              amount: xpAward,
              currency: GamificationCurrency.XP,
              type: GamificationTransactionType.EARN,
              reasonCode: v2Key,
              sourceType: v2Key,
              sourceRefKey,
              idempotencyKey,
              metadata: {
                ...meta,
                dateString,
                activityType,
                source: 'INGEST_ACTIVITY',
                version: 2,
              } as any,
            },
          });
        }
      }

      // Update profile amounts based on ledger award.
      if (!existingLedger && (xpAward > 0 || pointsAward > 0)) {
        const profile = await tx.gameProfile.findUnique({ where: { userId } });
        const prevTotalXp = profile?.totalXp ?? 0;
        const newTotalXp = prevTotalXp + xpAward;
        const newLevel = Math.floor(newTotalXp / this.XP_PER_LEVEL) + 1;
        const newCurrentXp = newTotalXp % this.XP_PER_LEVEL;

        await tx.gameProfile.update({
          where: { userId },
          data: {
            totalXp: newTotalXp,
            currentXp: newCurrentXp,
            points: { increment: pointsAward },
            level: newLevel,
          },
        });
      }

      // --- Streak 2.0 (streak logs are source of truth) ---
      let streakUpdated = false;
      if (isValidForStreak) {
        const existingToday = await tx.gameStreakLog.findFirst({
          where: { userId, date: dateString },
        });

        if (!existingToday) {
          // Find last ACTIVE/FREEZE day
          const last = await tx.gameStreakLog.findFirst({
            where: { userId, status: { in: ['ACTIVE', 'FREEZE'] } },
            orderBy: { date: 'desc' },
          });

          const profile = await tx.gameProfile.findUnique({
            where: { userId },
          });

          const lastDate = last?.date ?? null;
          const currentStreak = profile?.currentStreak ?? 0;
          const longestStreak = profile?.longestStreak ?? 0;
          const freezeCount = profile?.freezeCount ?? 0;
          const totalActiveDays = profile?.totalActiveDays ?? 0;

          let nextStreak = 1;
          let nextLongest = Math.max(longestStreak, 1);
          let nextFreeze = freezeCount;
          let usedFreeze = false;
          let nextTotalActiveDays = totalActiveDays + 1;

          if (lastDate) {
            const diff = this.diffDays(lastDate, dateString);
            if (diff === 0) {
              nextStreak = currentStreak || 1;
              usedFreeze = false;
            } else if (diff === 1) {
              nextStreak = currentStreak + 1;
              nextLongest = Math.max(longestStreak, nextStreak);
            } else if (
              diff === 2 &&
              (freezeCount > 0 || (meta as any)?.streakSavedByShield === true)
            ) {
              usedFreeze = true;
              nextStreak = currentStreak; // keep streak
              nextFreeze = freezeCount > 0 ? Math.max(0, freezeCount - 1) : 0;
              // Mark yesterday as FREEZE
              const yesterdayStr = this.getYesterdayStr(dateString);
              await tx.gameStreakLog.create({
                data: {
                  userId,
                  date: yesterdayStr,
                  status: 'FREEZE',
                },
              }).catch(() => undefined);
            } else {
              // Reset streak due to gap
              nextStreak = 1;
              nextLongest = Math.max(longestStreak, 1);
            }
          }

          await tx.gameStreakLog.create({
            data: {
              userId,
              date: dateString,
              status: 'ACTIVE',
            },
          }).catch(() => undefined);

          await tx.gameProfile.update({
            where: { userId },
            data: {
              currentStreak: nextStreak,
              longestStreak: nextLongest,
              freezeCount: nextFreeze,
              totalActiveDays: nextTotalActiveDays,
            },
          });

          streakUpdated = true;
        }
      }

      return {
        xpAward,
        pointsAward,
        v2Activity: v2Key,
        streakUpdated,
        date: dateString,
        idempotent: !!existingLedger,
      };
    });
  }
}

