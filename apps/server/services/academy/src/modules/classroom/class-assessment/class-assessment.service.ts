import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/generated';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
  ClassAssessmentAttemptQueryDto,
  ClassAssessmentCreateDto,
  ClassAssessmentQueryDto,
  ClassAssessmentUpdateDto,
} from './dto/class-assessment.dto';

@Injectable()
export class ClassAssessmentService {
  constructor(private readonly prisma: PrismaService) {}

  private readStringSetting(settings: unknown, key: string): string | null {
    if (!settings || typeof settings !== 'object') return null;
    const value = (settings as Record<string, unknown>)[key];
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  private extractQuizTemplateDefaultExamId(settings: unknown): string | null {
    return (
      this.readStringSetting(settings, 'defaultExamId') ??
      this.readStringSetting(settings, 'examId')
    );
  }

  private extractClassOverrideExamId(settings: unknown): string | null {
    return (
      this.readStringSetting(settings, 'overrideExamId') ??
      this.readStringSetting(settings, 'examId')
    );
  }

  private async validateEffectiveQuizExam(params: {
    classMode: string;
    classCourseProfileId: string;
    quizTemplateSettings: unknown;
    classAssessmentSettings: unknown;
  }) {
    const defaultExamId = this.extractQuizTemplateDefaultExamId(
      params.quizTemplateSettings,
    );
    const overrideExamId = this.extractClassOverrideExamId(
      params.classAssessmentSettings,
    );

    if (params.classMode === 'VOD' && overrideExamId) {
      throw new BadRequestException(
        'VOD class does not allow quiz override exam',
      );
    }

    const effectiveExamId =
      params.classMode === 'LIVE'
        ? (overrideExamId ?? defaultExamId)
        : defaultExamId;
    if (!effectiveExamId) {
      throw new BadRequestException(
        params.classMode === 'LIVE'
          ? 'LIVE quiz needs template defaultExamId or settings.overrideExamId'
          : 'VOD quiz requires quizTemplate.settings.defaultExamId',
      );
    }

    const exam = await this.prisma.exam.findUnique({
      where: { id: effectiveExamId },
      select: { id: true, status: true, courseProfileId: true },
    });
    if (!exam) throw new BadRequestException('Effective exam is not found');
    if (exam.courseProfileId !== params.classCourseProfileId) {
      throw new BadRequestException(
        'Effective exam does not belong to class courseProfile',
      );
    }
    if (exam.status !== 'PUBLISHED') {
      throw new BadRequestException('Effective exam must be PUBLISHED');
    }
  }

  async findAll(query: ClassAssessmentQueryDto) {
    return this.prisma.classAssessment.findMany({
      where: { classId: query.classId ?? undefined },
      orderBy: [{ createdAt: 'asc' }],
    });
  }

  async findById(id: string) {
    const item = await this.prisma.classAssessment.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('ClassAssessment not found');
    return item;
  }

  async create(input: ClassAssessmentCreateDto) {
    const klass = await this.prisma.class.findUnique({
      where: { id: input.classId },
      select: { id: true, mode: true, courseProfileId: true },
    });
    if (!klass) throw new BadRequestException('Invalid classId');

    const kind = input.kind.toUpperCase();
    if (kind === 'QUIZ') {
      if (!input.quizTemplateId)
        throw new BadRequestException('quizTemplateId is required for QUIZ');
      const quizTemplate = await this.prisma.quizTemplate.findUnique({
        where: { id: input.quizTemplateId },
        select: { id: true, courseProfileId: true, settings: true },
      });
      if (!quizTemplate)
        throw new BadRequestException('Invalid quizTemplateId');
      if (quizTemplate.courseProfileId !== klass.courseProfileId) {
        throw new BadRequestException(
          'quizTemplateId does not belong to class courseProfile',
        );
      }
      await this.validateEffectiveQuizExam({
        classMode: klass.mode,
        classCourseProfileId: klass.courseProfileId,
        quizTemplateSettings: quizTemplate.settings,
        classAssessmentSettings: input.settings,
      });
    }
    if (kind === 'ASSIGNMENT') {
      if (klass.mode === 'VOD') {
        throw new BadRequestException(
          'ASSIGNMENT is not supported for VOD classes',
        );
      }
      if (!input.assignmentTemplateId) {
        throw new BadRequestException(
          'assignmentTemplateId is required for ASSIGNMENT',
        );
      }
    }

    return this.prisma.classAssessment.create({
      data: {
        classId: input.classId,
        kind: input.kind,
        quizTemplateId: input.quizTemplateId,
        assignmentTemplateId: input.assignmentTemplateId,
        titleOverride: input.titleOverride,
        deadline:
          kind === 'QUIZ' && klass.mode === 'VOD' ? undefined : input.deadline,
        weight:
          input.weight !== undefined
            ? new Prisma.Decimal(input.weight)
            : undefined,
        maxAttemptsOverride: input.maxAttemptsOverride,
        timeLimitOverrideMinutes: input.timeLimitOverrideMinutes,
        maxScoreOverride:
          input.maxScoreOverride !== undefined
            ? new Prisma.Decimal(input.maxScoreOverride)
            : undefined,
        settings: input.settings ?? undefined,
        status: input.status ?? 'DRAFT',
      } as any,
    });
  }

  async update(id: string, input: ClassAssessmentUpdateDto) {
    const existing = await this.prisma.classAssessment.findUnique({
      where: { id },
      include: {
        class: { select: { id: true, mode: true, courseProfileId: true } },
        quizTemplate: {
          select: { id: true, courseProfileId: true, settings: true },
        },
      },
    });
    if (!existing) throw new NotFoundException('ClassAssessment not found');

    if (existing.kind === 'QUIZ') {
      if (
        !existing.quizTemplate ||
        existing.quizTemplate.courseProfileId !== existing.class.courseProfileId
      ) {
        throw new BadRequestException(
          'Invalid quiz template link for this assessment',
        );
      }
      await this.validateEffectiveQuizExam({
        classMode: existing.class.mode,
        classCourseProfileId: existing.class.courseProfileId,
        quizTemplateSettings: existing.quizTemplate.settings,
        classAssessmentSettings: input.settings ?? existing.settings,
      });
    }

    return this.prisma.classAssessment.update({
      where: { id },
      data: {
        titleOverride: input.titleOverride,
        deadline:
          existing.kind === 'QUIZ' && existing.class.mode === 'VOD'
            ? undefined
            : input.deadline,
        weight:
          input.weight !== undefined
            ? new Prisma.Decimal(input.weight)
            : undefined,
        maxAttemptsOverride: input.maxAttemptsOverride,
        timeLimitOverrideMinutes: input.timeLimitOverrideMinutes,
        maxScoreOverride:
          input.maxScoreOverride !== undefined
            ? new Prisma.Decimal(input.maxScoreOverride)
            : undefined,
        settings: input.settings ?? undefined,
        status: input.status,
      } as any,
    });
  }

  async publishAssessment(id: string) {
    const assessment = await this.prisma.classAssessment.findUnique({
      where: { id },
      include: { class: true, quizTemplate: true },
    });
    if (!assessment) throw new NotFoundException('ClassAssessment not found');
    if (assessment.status === 'PUBLISHED') return assessment;
    if (assessment.kind === 'ASSIGNMENT' && assessment.class.mode === 'VOD') {
      throw new BadRequestException(
        'ASSIGNMENT is not supported for VOD classes',
      );
    }
    if (assessment.kind === 'QUIZ') {
      if (!assessment.quizTemplate) {
        throw new BadRequestException('QUIZ assessment must have quizTemplate');
      }
      await this.validateEffectiveQuizExam({
        classMode: assessment.class.mode,
        classCourseProfileId: assessment.class.courseProfileId,
        quizTemplateSettings: assessment.quizTemplate.settings,
        classAssessmentSettings: assessment.settings,
      });
    }

    if (
      assessment.class.status !== 'ENROLLING' &&
      assessment.class.status !== 'IN_PROGRESS'
    ) {
      throw new BadRequestException(
        'Can only publish assessment for ENROLLING or IN_PROGRESS classes',
      );
    }

    return this.prisma.classAssessment.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });
  }

  async closeAssessment(id: string) {
    const assessment = await this.findById(id);
    if (assessment.status === 'CLOSED') return assessment;

    return this.prisma.classAssessment.update({
      where: { id },
      data: { status: 'CLOSED' },
    });
  }

  async delete(id: string) {
    const assessment = await this.prisma.classAssessment.findUnique({
      where: { id },
      include: {
        examAttempts: { select: { id: true }, take: 1 },
        assignmentSubmissions: { select: { id: true }, take: 1 },
      },
    });
    if (!assessment) throw new NotFoundException('ClassAssessment not found');

    if (
      assessment.examAttempts.length > 0 ||
      assessment.assignmentSubmissions.length > 0
    ) {
      throw new BadRequestException(
        'Cannot delete assessment with existing attempts or submissions',
      );
    }

    await this.prisma.classAssessment.delete({ where: { id } });
    return { ok: true };
  }

  async findAttemptsByAssessment(
    id: string,
    query: ClassAssessmentAttemptQueryDto,
  ) {
    await this.findById(id);

    const items = await this.prisma.examAttempt.findMany({
      where: {
        classAssessmentId: id,
        status: query.status ?? undefined,
        userId: query.userId ?? undefined,
        createdAt: {
          gte: query.fromDate ? new Date(query.fromDate) : undefined,
          lte: query.toDate ? new Date(query.toDate) : undefined,
        },
      },
      orderBy: [{ createdAt: 'desc' }],
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
      },
    });

    if (!query.latestOnly) return items;

    const latestMap = new Map<string, (typeof items)[number]>();
    for (const item of items) {
      if (!latestMap.has(item.userId)) {
        latestMap.set(item.userId, item);
      }
    }
    return Array.from(latestMap.values());
  }

  async findAttemptQuestionDetail(id: string, attemptId: string) {
    await this.findById(id);

    const attempt = await this.prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
        details: {
          include: {
            question: {
              select: {
                id: true,
                content: true,
                questionType: true,
                options: true,
                correctAnswer: true,
                explanation: true,
              },
            },
            examQuestion: {
              select: {
                id: true,
                points: true,
              },
            },
          },
          orderBy: [{ createdAt: 'asc' }],
        },
      },
    });

    if (!attempt || attempt.classAssessmentId !== id) {
      throw new NotFoundException('ExamAttempt not found for this assessment');
    }
    return attempt;
  }

  async findWrongQuestionAnalytics(
    id: string,
    query: ClassAssessmentAttemptQueryDto,
  ) {
    const attempts = await this.findAttemptsByAssessment(id, query);
    if (!attempts.length) {
      return {
        totalAttempts: 0,
        totalWrongAnswers: 0,
        questions: [],
      };
    }

    const attemptIds = attempts.map((attempt) => attempt.id);
    const details = await this.prisma.examAttemptDetail.findMany({
      where: {
        attemptId: { in: attemptIds },
      },
      include: {
        question: {
          select: {
            id: true,
            content: true,
            questionType: true,
          },
        },
      },
    });

    const stats = new Map<
      string,
      {
        questionId: string;
        questionContent: string;
        questionType: string;
        attempts: number;
        wrongCount: number;
      }
    >();

    for (const detail of details) {
      const key = detail.questionId;
      const current = stats.get(key) ?? {
        questionId: detail.questionId,
        questionContent: detail.question.content,
        questionType: detail.question.questionType,
        attempts: 0,
        wrongCount: 0,
      };
      current.attempts += 1;
      if (detail.isCorrect === false) {
        current.wrongCount += 1;
      }
      stats.set(key, current);
    }

    const questions = Array.from(stats.values())
      .map((item) => ({
        ...item,
        wrongRatePercent:
          item.attempts > 0
            ? Number(((item.wrongCount / item.attempts) * 100).toFixed(2))
            : 0,
      }))
      .filter((item) => item.wrongCount > 0)
      .sort(
        (a, b) =>
          b.wrongCount - a.wrongCount ||
          b.wrongRatePercent - a.wrongRatePercent,
      );

    return {
      totalAttempts: attempts.length,
      totalWrongAnswers: questions.reduce(
        (sum, item) => sum + item.wrongCount,
        0,
      ),
      questions,
    };
  }
}
