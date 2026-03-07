import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Prisma, PrismaService } from '@server/shared/prisma/prisma.service';
import { ExamAttemptService } from '../exam-attempt/exam-attempt.service';

type PlacementRetakePolicy = 'never' | 'always' | 'after_days';

interface PlacementSettings {
  maxAttemptsPerUser?: number | null;
  retakePolicy?: PlacementRetakePolicy;
  retakeAfterDays?: number | null;
  minAnsweredToSubmit?: number | null;
  placementScoring?: PlacementScoringConfig;
}

interface PlacementLevelThreshold {
  level: string;
  minPercentage: number;
}

interface PlacementScoringConfig {
  levelThresholds?: PlacementLevelThreshold[];
  assessedLevelRule?: 'highest_passed' | string;
  categoryWeights?: Record<string, number>;
}

interface PlacementInfoResult {
  examId: string | null;
  title: string | null;
  description: string | null;
  totalQuestions: number;
  timeLimitMinutes: number | null;
  retakePolicy: PlacementRetakePolicy;
  lastCompletedAttempt?: {
    attemptId: string;
    completedAt: Date;
    assessedLevel?: string;
  } | null;
  canRetake: boolean;
  nextAvailableAt: Date | null;
}

interface PlacementStartPayload {
  userId: string;
}

interface PlacementSubmitPayload {
  userId: string;
  attemptId: string;
  answers: Record<string, unknown>;
}

interface PlacementSubmitResult {
  attemptId: string;
  examId: string;
  assessedLevel: string;
  rawScore: number;
  maxScore: number;
  percentage: number;
  breakdownByCategory: Record<string, number>;
  levelPercentages: Record<string, number>;
  overTime: boolean;
}

@Injectable()
export class PlacementService {
  private readonly logger = new Logger(PlacementService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly examAttempts: ExamAttemptService,
  ) { }

  async getInfo(userId: string): Promise<PlacementInfoResult> {
    const exam = await this.findDefaultPlacementExam();

    if (!exam) {
      return {
        examId: null,
        title: null,
        description: null,
        totalQuestions: 0,
        timeLimitMinutes: null,
        retakePolicy: 'never',
        lastCompletedAttempt: null,
        canRetake: false,
        nextAvailableAt: null,
      };
    }

    const settings = this.parsePlacementSettings(exam.settings);

    const [totalQuestions, lastCompleted, attemptsCount] = await Promise.all([
      this.prisma.examQuestion.count({
        where: { examId: exam.id },
      }),
      this.prisma.examAttempt.findFirst({
        where: {
          examId: exam.id,
          userId,
          status: 'COMPLETED',
        },
        orderBy: { completedAt: 'desc' },
      }),
      this.prisma.examAttempt.count({
        where: {
          examId: exam.id,
          userId,
          status: { in: ['IN_PROGRESS', 'SUBMITTED', 'COMPLETED'] },
        },
      }),
    ]);

    const { canRetake, nextAvailableAt } = this.evaluateRetakePolicy(
      settings,
      lastCompleted ?? undefined,
      attemptsCount,
    );

    return {
      examId: exam.id,
      title: exam.title,
      description: exam.description ?? null,
      totalQuestions,
      timeLimitMinutes: exam.totalTimeLimitMinutes ?? null,
      retakePolicy: settings.retakePolicy ?? 'always',
      lastCompletedAttempt: lastCompleted
        ? {
          attemptId: lastCompleted.id,
          completedAt: lastCompleted.completedAt ?? lastCompleted.updatedAt,
          assessedLevel: (lastCompleted.metadata as any)?.placementResult?.assessedLevel,
        }
        : null,
      canRetake,
      nextAvailableAt,
    };
  }

  async start(input: PlacementStartPayload) {
    const exam = await this.findDefaultPlacementExam();
    if (!exam) throw new NotFoundException('No placement exam configured');

    const settings = this.parsePlacementSettings(exam.settings);

    const [lastCompleted, attemptsCount] = await Promise.all([
      this.prisma.examAttempt.findFirst({
        where: {
          examId: exam.id,
          userId: input.userId,
          status: 'COMPLETED',
        },
        orderBy: { completedAt: 'desc' },
      }),
      this.prisma.examAttempt.count({
        where: {
          examId: exam.id,
          userId: input.userId,
          status: { in: ['IN_PROGRESS', 'SUBMITTED', 'COMPLETED'] },
        },
      }),
    ]);

    const retake = this.evaluateRetakePolicy(settings, lastCompleted ?? undefined, attemptsCount);
    if (!retake.canRetake) {
      throw new BadRequestException(
        retake.nextAvailableAt
          ? `You can retake placement after ${retake.nextAvailableAt.toISOString()}`
          : 'You have reached the maximum number of placement attempts',
      );
    }

    const attempt = await this.examAttempts.start({
      examId: exam.id,
      userId: input.userId,
    });

    const fullExam = await this.prisma.exam.findUnique({
      where: { id: exam.id },
      include: {
        sections: { orderBy: { orderIndex: 'asc' } },
        examQuestions: {
          include: { question: true, section: true },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    if (!fullExam) {
      throw new NotFoundException('Placement exam not found');
    }

    const timeLimitSeconds = (exam.totalTimeLimitMinutes ?? 0) * 60;

    const questions = fullExam.examQuestions.map((eq) => {
      const q = eq.question;
      const options = this.normalizeOptions(q.options);
      const metadata = (q.metadata as any) || {};

      return {
        id: q.id,
        content: q.content,
        options,
        metadata: {
          jlptLevel: metadata.jlptLevel,
          category: metadata.category,
        },
      };
    });

    return {
      attemptId: attempt.id,
      status: attempt.status,
      startedAt: attempt.startedAt,
      deadlineAt: attempt.deadlineAt,
      questions,
      timeLimitSeconds: timeLimitSeconds || null,
    };
  }

  async submit(input: PlacementSubmitPayload): Promise<PlacementSubmitResult> {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: input.attemptId },
      include: {
        exam: {
          include: {
            examQuestions: {
              include: { question: true },
            },
          },
        },
      },
    });

    if (!attempt) throw new NotFoundException('ExamAttempt not found');
    if (attempt.userId !== input.userId) {
      throw new BadRequestException('Attempt does not belong to current user');
    }

    if (attempt.status !== 'IN_PROGRESS') {
      const meta = (attempt.metadata as any)?.placementResult;
      if (meta) {
        return {
          attemptId: attempt.id,
          examId: attempt.examId,
          assessedLevel: meta.assessedLevel ?? attempt.exam.level ?? 'N5',
          rawScore: Number(attempt.rawScore ?? 0),
          maxScore: Number(attempt.maxScore ?? 0),
          percentage: Number(attempt.percentage ?? 0),
          breakdownByCategory: meta.breakdownByCategory ?? {},
          levelPercentages: meta.levelPercentages ?? {},
          overTime: !!meta.overTime,
        };
      }
      throw new BadRequestException('Attempt is not in progress');
    }

    if (attempt.exam.examType !== 'PLACEMENT') {
      throw new BadRequestException('Attempt is not a placement exam');
    }

    const settings = this.parsePlacementSettings(attempt.exam.settings);

    const allExamQuestions = attempt.exam.examQuestions;
    const questionIds = new Set(allExamQuestions.map((eq) => eq.questionId));

    const answeredCount = Object.keys(input.answers || {}).filter((qid) =>
      questionIds.has(qid),
    ).length;

    if (settings.minAnsweredToSubmit && answeredCount < settings.minAnsweredToSubmit) {
      throw new BadRequestException('Not enough questions answered to submit placement');
    }

    const {
      rawScore,
      maxScore,
      percentage,
      assessedLevel,
      breakdownByCategory,
      levelPercentages,
      overTime,
    } = await this.scorePlacementAttempt(attempt.id, input.answers, settings.placementScoring);

    return {
      attemptId: attempt.id,
      examId: attempt.examId,
      assessedLevel,
      rawScore,
      maxScore,
      percentage,
      breakdownByCategory,
      levelPercentages,
      overTime,
    };
  }

  private async findDefaultPlacementExam() {
    return this.prisma.exam.findFirst({
      where: {
        examType: 'PLACEMENT',
        status: 'PUBLISHED',
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private parsePlacementSettings(settings: Prisma.JsonValue | null): PlacementSettings {
    const raw = (settings as any) || {};
    const placementSettings: PlacementSettings = {
      maxAttemptsPerUser: raw.maxAttemptsPerUser ?? null,
      retakePolicy: raw.retakePolicy ?? 'always',
      retakeAfterDays: raw.retakeAfterDays ?? null,
      minAnsweredToSubmit: raw.minAnsweredToSubmit ?? null,
      placementScoring: raw.placementScoring ?? {},
    };
    return placementSettings;
  }

  private evaluateRetakePolicy(
    settings: PlacementSettings,
    lastCompleted?: { completedAt: Date | null } | null,
    attemptsCount: number = 0,
  ): { canRetake: boolean; nextAvailableAt: Date | null } {
    const policy: PlacementRetakePolicy = settings.retakePolicy ?? 'always';

    if (settings.maxAttemptsPerUser && attemptsCount >= settings.maxAttemptsPerUser) {
      return { canRetake: false, nextAvailableAt: null };
    }

    if (policy === 'never') {
      if (lastCompleted) {
        return { canRetake: false, nextAvailableAt: null };
      }
      return { canRetake: true, nextAvailableAt: null };
    }

    if (policy === 'after_days') {
      if (!lastCompleted || !settings.retakeAfterDays) {
        return { canRetake: true, nextAvailableAt: null };
      }
      const completedAt = lastCompleted.completedAt ?? new Date();
      const nextAvailable = new Date(
        completedAt.getTime() + settings.retakeAfterDays * 24 * 60 * 60 * 1000,
      );
      if (nextAvailable <= new Date()) {
        return { canRetake: true, nextAvailableAt: null };
      }
      return { canRetake: false, nextAvailableAt: nextAvailable };
    }

    return { canRetake: true, nextAvailableAt: null };
  }

  private normalizeOptions(options: Prisma.JsonValue | null | undefined): string[] {
    const o: any = options;
    if (!o) return [];
    if (Array.isArray(o)) return o.map((v) => String(v));
    if (typeof o === 'string') {
      try {
        const parsed = JSON.parse(o);
        if (Array.isArray(parsed)) return parsed.map((v) => String(v));
        if (typeof parsed === 'object' && parsed !== null) {
          return Object.values(parsed).map((v) => String(v));
        }
      } catch {
        return [];
      }
    }
    if (typeof o === 'object') {
      return Object.values(o).map((v) => String(v));
    }
    return [];
  }

  private async scorePlacementAttempt(
    attemptId: string,
    answers: Record<string, unknown>,
    scoringConfig?: PlacementScoringConfig,
  ) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            examQuestions: {
              include: { question: true },
            },
          },
        },
      },
    });

    if (!attempt) {
      throw new NotFoundException('ExamAttempt not found for scoring');
    }

    const examQuestions = attempt.exam.examQuestions;

    let rawScore = 0;
    let maxScore = 0;

    const levelStats: Record<string, { earned: number; max: number }> = {};
    const categoryStats: Record<string, { earned: number; max: number }> = {};

    const detailCreates: Prisma.ExamAttemptDetailCreateManyInput[] = [];

    for (const eq of examQuestions) {
      const q = eq.question;
      const weight = Number(eq.points) || 1.0;
      maxScore += weight;

      const metadata = (q.metadata as any) || {};
      const jlptLevel: string | undefined = metadata.jlptLevel;
      const category: string | undefined = metadata.category;

      const userAnswerRaw = answers[q.id];
      const correctAnswer = q.correctAnswer as any;

      let isCorrect: boolean | null = null;
      let normalizedUserAnswer: any = null;

      if (userAnswerRaw !== undefined) {
        if (typeof correctAnswer === 'number') {
          const idx =
            typeof userAnswerRaw === 'number'
              ? userAnswerRaw
              : Number.parseInt(String(userAnswerRaw), 10);
          normalizedUserAnswer = Number.isFinite(idx) ? idx : userAnswerRaw;
        } else {
          normalizedUserAnswer = userAnswerRaw;
        }

        try {
          if (correctAnswer !== undefined && correctAnswer !== null) {
            const jsonEqual =
              JSON.stringify(normalizedUserAnswer) === JSON.stringify(correctAnswer) ||
              JSON.stringify(userAnswerRaw) === JSON.stringify(correctAnswer);
            isCorrect = jsonEqual;
          } else {
            isCorrect = null;
          }
        } catch {
          isCorrect = null;
        }
      } else {
        isCorrect = false;
      }

      const pointsEarned = isCorrect ? weight : 0;
      rawScore += pointsEarned;

      if (jlptLevel) {
        if (!levelStats[jlptLevel]) {
          levelStats[jlptLevel] = { earned: 0, max: 0 };
        }
        levelStats[jlptLevel].max += weight;
        levelStats[jlptLevel].earned += pointsEarned;
      }

      if (category) {
        if (!categoryStats[category]) {
          categoryStats[category] = { earned: 0, max: 0 };
        }
        categoryStats[category].max += weight;
        categoryStats[category].earned += pointsEarned;
      }

      detailCreates.push({
        attemptId: attempt.id,
        examQuestionId: eq.id,
        questionId: q.id,
        userAnswer: normalizedUserAnswer,
        isCorrect: isCorrect ?? null,
        pointsEarned,
      });
    }

    const percentage = maxScore > 0 ? (rawScore / maxScore) * 100 : 0;

    const levelPercentages: Record<string, number> = {};
    for (const [level, stat] of Object.entries(levelStats)) {
      if (stat.max > 0) {
        levelPercentages[level] = (stat.earned / stat.max) * 100;
      }
    }

    const breakdownByCategory: Record<string, number> = {};
    for (const [cat, stat] of Object.entries(categoryStats)) {
      if (stat.max > 0) {
        breakdownByCategory[cat] = stat.earned / stat.max;
      }
    }

    const assessedLevel = this.determineAssessedLevel(
      levelPercentages,
      scoringConfig ?? {},
      attempt.exam.level,
    );

    const now = new Date();
    const overTime = !!attempt.deadlineAt && attempt.deadlineAt < now;

    const placementResult = {
      assessedLevel,
      breakdownByCategory,
      levelPercentages,
      overTime,
    };

    await this.prisma.$transaction(async (tx) => {
      if (detailCreates.length > 0) {
        await tx.examAttemptDetail.deleteMany({ where: { attemptId: attempt.id } });
        await tx.examAttemptDetail.createMany({
          data: detailCreates,
        });
      }

      await tx.examAttempt.update({
        where: { id: attempt.id },
        data: {
          status: 'COMPLETED',
          submittedAt: now,
          completedAt: now,
          rawScore: new Prisma.Decimal(rawScore),
          maxScore: new Prisma.Decimal(maxScore),
          percentage: new Prisma.Decimal(percentage),
          metadata: {
            ...(attempt.metadata as any),
            placementResult,
          } as any,
        },
      });
    });

    return {
      rawScore,
      maxScore,
      percentage,
      assessedLevel,
      breakdownByCategory,
      levelPercentages,
      overTime,
    };
  }

  private determineAssessedLevel(
    levelPercentages: Record<string, number>,
    scoringConfig: PlacementScoringConfig,
    fallbackExamLevel?: string | null,
  ): string {
    const thresholds = scoringConfig.levelThresholds ?? [];
    if (!thresholds.length) {
      return fallbackExamLevel || 'N5';
    }

    const jlptOrder = ['N5', 'N4', 'N3', 'N2', 'N1'];
    const levelOrder = (level: string) => {
      const idx = jlptOrder.indexOf(level);
      return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
    };

    let chosen: string | null = null;
    let chosenOrder = -1;

    for (const th of thresholds) {
      const perc = levelPercentages[th.level];
      if (perc === undefined) continue;
      if (perc >= th.minPercentage) {
        const order = levelOrder(th.level);
        if (order > chosenOrder) {
          chosen = th.level;
          chosenOrder = order;
        }
      }
    }

    if (chosen) return chosen;

    const availableLevels = Object.keys(levelPercentages);
    if (availableLevels.length > 0) {
      availableLevels.sort((a, b) => levelOrder(a) - levelOrder(b));
      return availableLevels[0];
    }

    return fallbackExamLevel || 'N5';
  }
}

