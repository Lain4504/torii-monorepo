import { BadRequestException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/generated';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
  ExamAttemptQueryDto,
  ExamAttemptSaveAnswersDto,
  ExamAttemptStartDto,
  ExamAttemptSubmitDto,
} from './dto/exam-attempt.dto';
import { AuditLoggerService } from '../../audit-logger.service';
import { GamificationService } from '../../gamification/gamification.service';
import { ActivityType } from '@prisma/generated';

@Injectable()
export class ExamAttemptService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLoggerService,
    private readonly gamification: GamificationService,
  ) { }

  async findAll(query: ExamAttemptQueryDto) {
    return this.prisma.examAttempt.findMany({
      where: {
        examId: query.examId ?? undefined,
        userId: query.userId ?? undefined,
        classId: query.classId ?? undefined,
        status: query.status ?? undefined,
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async findById(id: string) {
    const item = await this.prisma.examAttempt.findUnique({
      where: { id },
      include: { sections: true, details: true },
    });
    if (!item) throw new NotFoundException('ExamAttempt not found');
    return item;
  }

  async start(input: ExamAttemptStartDto) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: input.examId },
      include: { sections: true },
    });
    if (!exam) throw new BadRequestException('Invalid examId');

    if (input.classId) {
      const klass = await this.prisma.class.findUnique({
        where: { id: input.classId },
        select: { id: true },
      });
      if (!klass) throw new BadRequestException('Invalid classId');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: input.userId },
      select: { id: true },
    });
    if (!user) throw new BadRequestException('Invalid userId');

    // Check max attempts
    let maxAttempts: number | null | undefined = undefined;
    if (input.classAssessmentId) {
      const ca = await this.prisma.classAssessment.findUnique({
        where: { id: input.classAssessmentId },
        select: { maxAttemptsOverride: true },
      });
      maxAttempts = ca?.maxAttemptsOverride;
    }

    if (maxAttempts) {
      const attemptCount = await this.prisma.examAttempt.count({
        where: {
          examId: input.examId,
          userId: input.userId,
          classAssessmentId: input.classAssessmentId,
        },
      });
      if (attemptCount >= maxAttempts) {
        throw new BadRequestException('Maximum attempts reached for this assessment');
      }
    }

    // Create attempt + section states
    const sortedSections = [...exam.sections].sort((a, b) => a.orderIndex - b.orderIndex);
    const firstSectionId = sortedSections[0]?.id;

    const now = new Date();
    const deadlineAt = exam.totalTimeLimitMinutes
      ? new Date(now.getTime() + exam.totalTimeLimitMinutes * 60000)
      : null;

    // Question shuffle logic (Level 2)
    const settings = (exam.settings as any) || {};
    const questionOrder: Record<string, string[]> = {};

    if (settings.shuffleQuestions) {
      for (const section of exam.sections) {
        const eqLinks = await this.prisma.examQuestion.findMany({
          where: { examId: input.examId, sectionId: section.id },
          select: { questionId: true },
          orderBy: { orderIndex: 'asc' },
        });

        const shuffledIds = eqLinks.map((l) => l.questionId);
        // Fisher-Yates shuffle
        for (let i = shuffledIds.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledIds[i], shuffledIds[j]] = [shuffledIds[j], shuffledIds[i]];
        }
        questionOrder[section.id] = shuffledIds;
      }
    }

    const result = await this.prisma.examAttempt.create({
      data: {
        examId: input.examId,
        classId: input.classId,
        userId: input.userId,
        classAssessmentId: input.classAssessmentId,
        status: 'IN_PROGRESS',
        startedAt: now,
        deadlineAt,
        maxScore: null,
        sections: {
          create: sortedSections.map((s) => ({
            sectionId: s.id,
            status: s.id === firstSectionId ? 'IN_PROGRESS' : 'LOCKED',
            startedAt: s.id === firstSectionId ? now : null,
          })),
        },
        metadata: { questionOrder } as any,
      },
      include: { sections: true },
    });

    await this.audit.log({
      userId: input.userId,
      action: 'exam.start',
      entity: 'ExamAttempt',
      entityId: result.id,
      description: `Started exam attempt for ${exam.title}`,
    });

    return result;
  }

  async saveAnswers(input: ExamAttemptSaveAnswersDto) {
    await this.findById(input.attemptId);
    return this.prisma.examAttempt.update({
      where: { id: input.attemptId },
      data: {
        draftAnswers: input.draftAnswers as any,
        updatedAt: new Date(),
      },
    });
  }

  async nextSection(attemptId: string, currentSectionId: string) {
    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        sections: { orderBy: { section: { orderIndex: 'asc' } } },
        exam: { include: { sections: { orderBy: { orderIndex: 'asc' } } } },
      },
    });
    if (!attempt) throw new NotFoundException('ExamAttempt not found');
    if (attempt.status !== 'IN_PROGRESS') {
      throw new BadRequestException('ExamAttempt is not IN_PROGRESS');
    }

    const currentIdx = attempt.exam.sections.findIndex((s) => s.id === currentSectionId);
    if (currentIdx === -1) throw new BadRequestException('Invalid currentSectionId');

    // Close current section
    await this.prisma.examAttemptSectionState.updateMany({
      where: { attemptId, sectionId: currentSectionId },
      data: { status: 'COMPLETED', endedAt: new Date() },
    });

    const nextSection = attempt.exam.sections[currentIdx + 1];
    if (nextSection) {
      await this.prisma.examAttemptSectionState.updateMany({
        where: { attemptId, sectionId: nextSection.id },
        data: { status: 'IN_PROGRESS', startedAt: new Date() },
      });
      return { nextSectionId: nextSection.id };
    } else {
      // No more sections, suggest submission
      return { nextSectionId: null, message: 'All sections completed. Please submit.' };
    }
  }

  async submit(input: ExamAttemptSubmitDto) {
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
        classAssessment: true,
      },
    });
    if (!attempt) throw new NotFoundException('ExamAttempt not found');
    if (attempt.status !== 'IN_PROGRESS') return attempt;

    const examQuestions = attempt.exam.examQuestions;
    const answerMap = this.extractAnswerMap(attempt.draftAnswers);

    let rawScore = 0;
    let totalMaxScore = 0;
    let hasSubjective = false;

    for (const eq of examQuestions) {
      const q = eq.question;
      const weight = Number(eq.points) || 1.0;

      if (q.questionType === 'GROUP_PARENT') {
        continue;
      }

      if (q.questionType === 'ESSAY' || q.questionType === 'ORAL' || q.questionType === 'SHORT_ANSWER') {
        hasSubjective = true;
        continue;
      }

      totalMaxScore += weight;

      const userAnswer = answerMap[q.id];
      const correctAnswer = q.correctAnswer;

      if (this.isAnswerCorrect(q.questionType, userAnswer, correctAnswer)) {
        rawScore += weight;
      }
    }

    const percentage = totalMaxScore > 0 ? (rawScore / totalMaxScore) * 100 : 0;

    // Determine passing threshold
    let passingThreshold = 50;
    const settings = (attempt.classAssessment?.settings as any) || (attempt.exam?.settings as any) || {};
    if (settings.passingScorePercent) passingThreshold = settings.passingScorePercent;

    const isPassed = percentage >= passingThreshold;

    const result = await this.prisma.examAttempt.update({
      where: { id: input.attemptId },
      data: {
        status: hasSubjective ? 'SUBMITTED' : 'COMPLETED',
        submittedAt: new Date(),
        completedAt: hasSubjective ? null : new Date(),
        percentage: new Prisma.Decimal(percentage),
        rawScore: new Prisma.Decimal(rawScore),
        maxScore: new Prisma.Decimal(totalMaxScore),
        isPassed: hasSubjective ? null : isPassed,
      } as any,
    });

    await this.audit.log({
      userId: attempt.userId,
      action: 'exam.submit',
      entity: 'ExamAttempt',
      entityId: input.attemptId,
      description: `Submitted exam attempt. Score: ${percentage.toFixed(2)}%`,
      metadata: { percentage, isPassed },
    });

    // Trigger Gamification Activity
    this.gamification.trackActivity(attempt.userId, ActivityType.EXAM_COMPLETE, {
      examAttemptId: result.id,
      examId: attempt.examId,
      classId: attempt.classId,
      isPassed: result.isPassed,
      percentage: result.percentage,
    }).catch(err => this.logger.error(`Failed to track exam activity for user ${attempt.userId}: ${err.message}`));

    return result;
  }

  private readonly logger = new Logger(ExamAttemptService.name);

  private extractAnswerMap(draftAnswers: unknown): Record<string, unknown> {
    if (!draftAnswers || typeof draftAnswers !== 'object') return {};
    const parsed = draftAnswers as Record<string, unknown>;
    if (
      parsed.answers &&
      typeof parsed.answers === 'object' &&
      !Array.isArray(parsed.answers)
    ) {
      return parsed.answers as Record<string, unknown>;
    }
    return parsed;
  }

  private normalizeSingleAnswer(value: unknown): string | null {
    if (value == null) return null;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return String(value).trim();
    }
    if (typeof value === 'object' && 'value' in (value as any)) {
      const inner = (value as any).value;
      if (inner == null) return null;
      return String(inner).trim();
    }
    return null;
  }

  private normalizeMultiAnswer(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value
      .map((item) => this.normalizeSingleAnswer(item))
      .filter((item): item is string => Boolean(item))
      .sort();
  }

  private isAnswerCorrect(questionType: string, userAnswer: unknown, correctAnswer: unknown): boolean {
    if (userAnswer === undefined) return false;

    if (questionType === 'MULTIPLE_CHOICE') {
      const user = this.normalizeMultiAnswer(userAnswer);
      const correct = this.normalizeMultiAnswer(correctAnswer);
      if (user.length !== correct.length) return false;
      return user.every((v, idx) => v === correct[idx]);
    }

    if (questionType === 'SINGLE_CHOICE' || questionType === 'TRUE_FALSE') {
      const user = this.normalizeSingleAnswer(userAnswer);
      const correct = this.normalizeSingleAnswer(correctAnswer);
      return Boolean(user && correct && user === correct);
    }

    return JSON.stringify(userAnswer) === JSON.stringify(correctAnswer);
  }
}

