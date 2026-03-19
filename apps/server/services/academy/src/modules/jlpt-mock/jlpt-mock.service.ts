import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { Prisma } from '@prisma/generated';
import type { JlptMockExamTemplateCreateDto } from './dto/jlpt-mock.dto';
import type { JlptMockExamTemplateUpdateDto } from './dto/jlpt-mock.dto';
import type {
  JlptBankQuestionCreateDto,
  JlptBankQuestionQueryDto,
  JlptBankQuestionUpdateDto,
} from './dto/jlpt-bank.dto';

type AttachQuestionItem = {
  questionId: string;
  sectionId: string;
  mondaiId?: string;
  orderIndex: number;
  weight?: number;
};

type SaveAnswerItem = {
  templateQuestionId: string;
  selectedOptionId?: string;
};

@Injectable()
export class JlptMockService {
  constructor(private readonly prisma: PrismaService) {}

  // -------------------------
  // JLPT Question Bank (admin)
  // -------------------------

  async findAllBankQuestions(query: JlptBankQuestionQueryDto) {
    const andFilters: Prisma.JlptQuestionBankQuestionWhereInput[] = [];

    if (query.level) {
      const level = await this.prisma.jlptLevel.findUnique({
        where: { code: query.level as any },
        select: { id: true },
      });
      if (!level) return [];
      andFilters.push({ levelId: level.id });
    }

    if (query.sectionCode) andFilters.push({ sectionCode: query.sectionCode as any });
    if (query.questionType) andFilters.push({ questionType: query.questionType as any });
    if (query.difficulty) andFilters.push({ difficulty: query.difficulty as any });

    if (query.mondaiCode) {
      andFilters.push({ mondai: { is: { code: query.mondaiCode } } });
    }

    if (query.q) {
      andFilters.push({
        OR: [
          { stemText: { contains: query.q, mode: 'insensitive' } },
          { contextText: { contains: query.q, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.JlptQuestionBankQuestionWhereInput =
      andFilters.length > 0 ? { AND: andFilters } : {};

    return this.prisma.jlptQuestionBankQuestion.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      take: query.take ?? 50,
      include: {
        mondai: { select: { id: true, code: true, titleVi: true } },
        options: { orderBy: [{ orderIndex: 'asc' }] },
        level: { select: { code: true } },
      },
    });
  }

  async createBankQuestion(input: JlptBankQuestionCreateDto, requesterId?: string) {
    const level = await this.prisma.jlptLevel.findUnique({
      where: { code: input.level as any },
      select: { id: true },
    });
    if (!level) throw new BadRequestException('Invalid JLPT level');

    let mondaiId: string | null = null;
    if (input.mondaiCode) {
      const section = await this.prisma.jlptSection.findFirst({
        where: { levelId: level.id, code: input.sectionCode as any },
        select: { id: true },
      });
      if (!section) throw new BadRequestException('Invalid section for level');
      const mondai = await this.prisma.jlptMondai.findFirst({
        where: { sectionId: section.id, code: input.mondaiCode },
        select: { id: true },
      });
      mondaiId = mondai?.id ?? null;
    }

    return this.prisma.jlptQuestionBankQuestion.create({
      data: {
        levelId: level.id,
        sectionCode: input.sectionCode as any,
        mondaiId,
        questionType: input.questionType as any,
        stemText: input.stemText,
        contextText: input.contextText ?? null,
        explanation: input.explanation ?? null,
        difficulty: (input.difficulty as any) ?? 'EASY',
        sourceProvider: requesterId ? 'manual' : 'manual',
        sourceRef: null,
        sourcePayload: Prisma.DbNull,
        options: {
          create: input.options.map((o, idx) => ({
            key: o.key,
            contentText: o.contentText,
            isCorrect: !!o.isCorrect,
            orderIndex: o.orderIndex ?? idx,
          })),
        },
      },
      include: { options: true },
    });
  }

  async updateBankQuestion(id: string, input: JlptBankQuestionUpdateDto, requesterId?: string) {
    const before = await this.prisma.jlptQuestionBankQuestion.findUnique({
      where: { id },
      select: { id: true, levelId: true, sectionCode: true },
    });
    if (!before) throw new NotFoundException('Bank question not found');

    let mondaiId: string | null | undefined;
    if (input.mondaiCode !== undefined) {
      if (!input.mondaiCode) {
        mondaiId = null;
      } else {
        const section = await this.prisma.jlptSection.findFirst({
          where: {
            levelId: before.levelId,
            code: (input.sectionCode as any) ?? before.sectionCode,
          },
          select: { id: true },
        });
        if (!section) throw new BadRequestException('Invalid section for level');
        const mondai = await this.prisma.jlptMondai.findFirst({
          where: { sectionId: section.id, code: input.mondaiCode },
          select: { id: true },
        });
        mondaiId = mondai?.id ?? null;
      }
    }

    return this.prisma.jlptQuestionBankQuestion.update({
      where: { id },
      data: {
        questionType: (input.questionType as any) ?? undefined,
        sectionCode: (input.sectionCode as any) ?? undefined,
        mondaiId,
        stemText: input.stemText ?? undefined,
        contextText: input.contextText ?? undefined,
        explanation: input.explanation ?? undefined,
        difficulty: (input.difficulty as any) ?? undefined,
        options:
          input.options !== undefined
            ? {
                deleteMany: {},
                create: input.options.map((o, idx) => ({
                  key: o.key,
                  contentText: o.contentText,
                  isCorrect: !!o.isCorrect,
                  orderIndex: o.orderIndex ?? idx,
                })),
              }
            : undefined,
      },
      include: { options: true },
    });
  }

  // -------------------------
  // Templates (learner/admin)
  // -------------------------

  async findAllTemplates(query: {
    level?: string;
    status?: string;
    q?: string;
  }) {
    const andFilters: Prisma.JlptMockExamTemplateWhereInput[] = [];

    if (query.level) {
      const level = await this.prisma.jlptLevel.findUnique({
        where: { code: query.level as any },
        select: { id: true },
      });
      if (!level) return [];
      andFilters.push({ levelId: level.id });
    }

    if (query.status) {
      andFilters.push({ status: query.status as any });
    }

    if (query.q) {
      andFilters.push({
        OR: [
          { title: { contains: query.q, mode: 'insensitive' } },
          { code: { contains: query.q, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.JlptMockExamTemplateWhereInput =
      andFilters.length > 0 ? { AND: andFilters } : {};

    return this.prisma.jlptMockExamTemplate.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
      include: {
        level: { select: { code: true } },
      },
    });
  }

  async findTemplateById(id: string) {
    const template = await this.prisma.jlptMockExamTemplate.findUnique({
      where: { id },
      include: {
        level: { select: { code: true } },
        sections: {
          orderBy: [{ orderIndex: 'asc' }],
          include: {
            mondai: { orderBy: [{ orderIndex: 'asc' }] },
          },
        },
        questions: {
          orderBy: [{ orderIndex: 'asc' }],
          include: {
            section: { select: { id: true, orderIndex: true, code: true } },
            mondai: { select: { id: true, code: true, titleVi: true } },
            question: {
              include: { options: { orderBy: [{ orderIndex: 'asc' }] } },
            },
          },
        },
      },
    });
    if (!template) throw new NotFoundException('JLPT mock template not found');

    // Hide correctness for learner usage (admin can fetch from DB directly if needed)
    const questions = template.questions.map((q) => ({
      id: q.id,
      templateId: q.templateId,
      sectionId: q.sectionId,
      mondaiId: q.mondaiId,
      questionId: q.questionId,
      orderIndex: q.orderIndex,
      weight: q.weight,
      question: {
        id: q.question.id,
        levelId: q.question.levelId,
        sectionCode: q.question.sectionCode,
        mondaiId: q.question.mondaiId,
        questionType: q.question.questionType,
        stemText: q.question.stemText,
        contextText: q.question.contextText,
        difficulty: q.question.difficulty,
        weight: q.question.weight,
        audioAssetId: q.question.audioAssetId,
        imageAssetId: q.question.imageAssetId,
        options: q.question.options.map((o) => ({
          id: o.id,
          key: o.key,
          contentText: o.contentText,
          orderIndex: o.orderIndex,
        })),
      },
    }));

    return { ...template, questions };
  }

  async createTemplate(input: JlptMockExamTemplateCreateDto, requesterId?: string) {
    const level = await this.prisma.jlptLevel.findUnique({
      where: { code: input.level as any },
      select: { id: true, code: true },
    });
    if (!level) throw new BadRequestException('Invalid JLPT level');

    const profile = await this.prisma.jlptScoringProfile.findUnique({
      where: { id: input.scoringProfileId },
      select: { id: true, levelId: true },
    });
    if (!profile) throw new BadRequestException('Scoring profile not found');
    if (profile.levelId !== level.id)
      throw new BadRequestException('Scoring profile does not match level');

    const sections = this._defaultSections(level.code as any);

    return this.prisma.jlptMockExamTemplate.create({
      data: {
        levelId: level.id,
        scoringProfileId: profile.id,
        code: input.code,
        title: input.title,
        description: input.description ?? null,
        status: (input.status as any) ?? 'DRAFT',
        availableFrom: input.availableFrom ? new Date(input.availableFrom) : null,
        availableTo: input.availableTo ? new Date(input.availableTo) : null,
        maxAttemptsPerUser: input.maxAttemptsPerUser ?? null,
        showDetailedReview: input.showDetailedReview ?? true,
        showCorrectAnswerImmediately: input.showCorrectAnswerImmediately ?? false,
        createdBy: requesterId ?? null,
        sections: {
          create: sections.map((s) => ({
            code: s.code as any,
            title: s.title,
            durationMinutes: s.durationMinutes,
            orderIndex: s.orderIndex,
            isListening: s.isListening,
          })),
        },
      },
      include: { sections: true },
    });
  }

  async updateTemplate(id: string, input: JlptMockExamTemplateUpdateDto, requesterId?: string) {
    const before = await this.prisma.jlptMockExamTemplate.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!before) throw new NotFoundException('JLPT mock template not found');

    // Keep: scoringProfileId can be changed but must match level
    let scoringProfileId: string | undefined;
    if (input.scoringProfileId) {
      const tpl = await this.prisma.jlptMockExamTemplate.findUnique({
        where: { id },
        select: { levelId: true },
      });
      if (!tpl) throw new NotFoundException('JLPT mock template not found');
      const profile = await this.prisma.jlptScoringProfile.findUnique({
        where: { id: input.scoringProfileId },
        select: { id: true, levelId: true },
      });
      if (!profile) throw new BadRequestException('Scoring profile not found');
      if (profile.levelId !== tpl.levelId)
        throw new BadRequestException('Scoring profile does not match level');
      scoringProfileId = profile.id;
    }

    return this.prisma.jlptMockExamTemplate.update({
      where: { id },
      data: {
        code: input.code ?? undefined,
        title: input.title ?? undefined,
        description: input.description ?? undefined,
        scoringProfileId,
        status: (input.status as any) ?? undefined,
        availableFrom: input.availableFrom ? new Date(input.availableFrom) : undefined,
        availableTo: input.availableTo ? new Date(input.availableTo) : undefined,
        maxAttemptsPerUser: input.maxAttemptsPerUser ?? undefined,
        showDetailedReview: input.showDetailedReview ?? undefined,
        showCorrectAnswerImmediately: input.showCorrectAnswerImmediately ?? undefined,
        updatedAt: new Date(),
      },
    });
  }

  async attachQuestions(templateId: string, items: AttachQuestionItem[], requesterId?: string) {
    const template = await this.prisma.jlptMockExamTemplate.findUnique({
      where: { id: templateId },
      select: { id: true, status: true },
    });
    if (!template) throw new NotFoundException('JLPT mock template not found');
    if (template.status === 'ARCHIVED')
      throw new BadRequestException('Template is archived');

    // Minimal validation: section must belong to template
    const sectionIds = [...new Set(items.map((i) => i.sectionId))];
    const sections = await this.prisma.jlptMockExamSection.findMany({
      where: { templateId, id: { in: sectionIds } },
      select: { id: true },
    });
    if (sections.length !== sectionIds.length)
      throw new BadRequestException('Invalid sectionId');

    await this.prisma.$transaction(
      items.map((i) =>
        this.prisma.jlptMockExamTemplateQuestion.upsert({
          where: {
            templateId_orderIndex: { templateId, orderIndex: i.orderIndex },
          },
          create: {
            templateId,
            sectionId: i.sectionId,
            mondaiId: i.mondaiId ?? null,
            questionId: i.questionId,
            orderIndex: i.orderIndex,
            weight: i.weight != null ? new Prisma.Decimal(i.weight) : null,
          },
          update: {
            sectionId: i.sectionId,
            mondaiId: i.mondaiId ?? null,
            questionId: i.questionId,
            weight: i.weight != null ? new Prisma.Decimal(i.weight) : null,
          },
        }),
      ),
    );

    return { ok: true };
  }

  // -------------------------
  // Attempts (learner runtime)
  // -------------------------

  async startAttempt(templateId: string, userId?: string) {
    if (!userId) throw new BadRequestException('userId is required');

    const template = await this.prisma.jlptMockExamTemplate.findUnique({
      where: { id: templateId },
      include: {
        level: { select: { code: true } },
        sections: { orderBy: [{ orderIndex: 'asc' }] },
      },
    });
    if (!template) throw new NotFoundException('JLPT mock template not found');
    if (template.status !== 'PUBLISHED')
      throw new ForbiddenException('Template is not available');

    const now = new Date();
    if (template.availableFrom && now < template.availableFrom)
      throw new ForbiddenException('Not available yet');
    if (template.availableTo && now > template.availableTo)
      throw new ForbiddenException('Expired');

    if (template.maxAttemptsPerUser && template.maxAttemptsPerUser > 0) {
      const count = await this.prisma.jlptMockAttempt.count({
        where: { templateId, userId },
      });
      if (count >= template.maxAttemptsPerUser)
        throw new ForbiddenException('Max attempts reached');
    }

    // Create attempt + attempt sections in one transaction
    return this.prisma.$transaction(async (tx) => {
      const attempt = await tx.jlptMockAttempt.create({
        data: {
          userId,
          templateId,
          levelCode: template.level.code,
          status: 'IN_PROGRESS',
          startedAt: now,
        },
      });

      const attemptSections = template.sections.map((s) => {
        const isFirst = s.orderIndex === 1;
        const endsAt = isFirst
          ? new Date(now.getTime() + s.durationMinutes * 60_000)
          : null;
        return {
          attemptId: attempt.id,
          sectionId: s.id,
          orderIndex: s.orderIndex,
          status: isFirst ? 'ACTIVE' : 'LOCKED',
          startedAt: isFirst ? now : null,
          endsAt,
        };
      });

      await tx.jlptMockAttemptSection.createMany({ data: attemptSections });

      return {
        attemptId: attempt.id,
        serverTime: now.toISOString(),
        currentSectionOrder: 1,
        endsAt: attemptSections.find((s) => s.orderIndex === 1)?.endsAt?.toISOString(),
      };
    });
  }

  async saveAnswers(attemptId: string, answers: SaveAnswerItem[], requesterId?: string) {
    const attempt = await this.prisma.jlptMockAttempt.findUnique({
      where: { id: attemptId },
      select: { id: true, userId: true, status: true },
    });
    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.status !== 'IN_PROGRESS')
      throw new BadRequestException('Attempt is not in progress');
    if (requesterId && requesterId !== attempt.userId)
      throw new ForbiddenException('Not allowed');

    const tqIds = [...new Set(answers.map((a) => a.templateQuestionId))];
    const tqs = await this.prisma.jlptMockExamTemplateQuestion.findMany({
      where: { id: { in: tqIds } },
      select: { id: true, questionId: true },
    });
    const tqMap = new Map(tqs.map((t) => [t.id, t]));

    await this.prisma.$transaction(
      answers.map((a) => {
        const tq = tqMap.get(a.templateQuestionId);
        if (!tq)
          throw new BadRequestException(`Invalid templateQuestionId: ${a.templateQuestionId}`);

        return this.prisma.jlptMockAnswer.upsert({
          where: {
            attemptId_templateQuestionId: {
              attemptId,
              templateQuestionId: a.templateQuestionId,
            },
          },
          create: {
            attemptId,
            templateQuestionId: a.templateQuestionId,
            questionId: tq.questionId,
            selectedOptionId: a.selectedOptionId ?? null,
          },
          update: {
            selectedOptionId: a.selectedOptionId ?? null,
            answeredAt: new Date(),
          },
        });
      }),
    );

    return { ok: true };
  }

  async nextSection(attemptId: string, currentSectionOrder: number, requesterId?: string) {
    const attempt = await this.prisma.jlptMockAttempt.findUnique({
      where: { id: attemptId },
      select: { id: true, userId: true, status: true },
    });
    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.status !== 'IN_PROGRESS')
      throw new BadRequestException('Attempt is not in progress');
    if (requesterId && requesterId !== attempt.userId)
      throw new ForbiddenException('Not allowed');

    const current = await this.prisma.jlptMockAttemptSection.findUnique({
      where: { attemptId_orderIndex: { attemptId, orderIndex: currentSectionOrder } },
      include: { section: true },
    });
    if (!current) throw new NotFoundException('Attempt section not found');
    if (current.status !== 'ACTIVE')
      throw new BadRequestException('Current section is not active');

    const next = await this.prisma.jlptMockAttemptSection.findUnique({
      where: {
        attemptId_orderIndex: { attemptId, orderIndex: currentSectionOrder + 1 },
      },
      include: { section: true },
    });
    if (!next) {
      return { ok: true, done: true };
    }
    if (next.status !== 'LOCKED')
      throw new BadRequestException('Next section is not locked');

    const now = new Date();
    const endsAt = new Date(now.getTime() + next.section.durationMinutes * 60_000);

    await this.prisma.$transaction([
      this.prisma.jlptMockAttemptSection.update({
        where: { id: current.id },
        data: { status: 'FINISHED', endedAt: now, endsAt: null },
      }),
      this.prisma.jlptMockAttemptSection.update({
        where: { id: next.id },
        data: { status: 'ACTIVE', startedAt: now, endsAt },
      }),
    ]);

    return {
      ok: true,
      currentSectionOrder: currentSectionOrder + 1,
      serverTime: now.toISOString(),
      endsAt: endsAt.toISOString(),
    };
  }

  async submitAttempt(attemptId: string, requesterId?: string) {
    const attempt = await this.prisma.jlptMockAttempt.findUnique({
      where: { id: attemptId },
      include: {
        template: {
          include: {
            scoringProfile: { include: { mappings: true } },
            questions: { include: { question: true, section: true } },
          },
        },
        answers: true,
      },
    });
    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.status !== 'IN_PROGRESS')
      throw new BadRequestException('Attempt is not in progress');
    if (requesterId && requesterId !== attempt.userId)
      throw new ForbiddenException('Not allowed');

    // Evaluate correctness
    const answerByTq = new Map(
      attempt.answers.map((a) => [a.templateQuestionId, a]),
    );

    const tqs = attempt.template.questions;
    const questionIds = tqs.map((t) => t.questionId);
    const options = await this.prisma.jlptQuestionBankOption.findMany({
      where: { questionId: { in: questionIds } },
      select: { id: true, questionId: true, isCorrect: true },
    });
    const correctOptionByQuestion = new Map(
      options.filter((o) => o.isCorrect).map((o) => [o.questionId, o.id]),
    );

    // Compute raw/max per domain
    let langRaw = 0;
    let readRaw = 0;
    let listenRaw = 0;
    let langMax = 0;
    let readMax = 0;
    let listenMax = 0;

    const answerUpserts: Prisma.JlptMockAnswerUpsertArgs[] = [];

    for (const tq of tqs) {
      const weight = Number(tq.weight ?? tq.question.weight ?? 1);
      const domain = this._domainForQuestion(tq.question as any);

      if (domain === 'LANGUAGE') langMax += weight;
      if (domain === 'READING') readMax += weight;
      if (domain === 'LISTENING') listenMax += weight;

      const ans = answerByTq.get(tq.id);
      if (!ans || !ans.selectedOptionId) continue;

      const correctOptionId = correctOptionByQuestion.get(tq.questionId);
      const isCorrect = !!correctOptionId && ans.selectedOptionId === correctOptionId;

      const awarded = isCorrect ? weight : 0;
      if (domain === 'LANGUAGE') langRaw += awarded;
      if (domain === 'READING') readRaw += awarded;
      if (domain === 'LISTENING') listenRaw += awarded;

      answerUpserts.push({
        where: {
          attemptId_templateQuestionId: {
            attemptId: attempt.id,
            templateQuestionId: tq.id,
          },
        },
        create: {
          attemptId: attempt.id,
          templateQuestionId: tq.id,
          questionId: tq.questionId,
          selectedOptionId: ans.selectedOptionId,
          isCorrect,
          scoreAwarded: new Prisma.Decimal(awarded),
        },
        update: {
          isCorrect,
          scoreAwarded: new Prisma.Decimal(awarded),
        },
      });
    }

    const profile = attempt.template.scoringProfile;
    const scaled = {
      language: this._mapScaled(profile.mappings, 'LANGUAGE', langRaw, langMax),
      reading: this._mapScaled(profile.mappings, 'READING', readRaw, readMax),
      listening: this._mapScaled(profile.mappings, 'LISTENING', listenRaw, listenMax),
    };
    const totalScaled = scaled.language + scaled.reading + scaled.listening;

    const passMock = this._isPass(profile, scaled.language, scaled.reading, scaled.listening, totalScaled);

    const now = new Date();
    await this.prisma.$transaction([
      ...answerUpserts.map((args) => this.prisma.jlptMockAnswer.upsert(args)),
      this.prisma.jlptMockAttempt.update({
        where: { id: attempt.id },
        data: {
          status: 'SUBMITTED',
          submittedAt: now,
          languageScoreRaw: new Prisma.Decimal(langRaw),
          readingScoreRaw: new Prisma.Decimal(readRaw),
          listeningScoreRaw: new Prisma.Decimal(listenRaw),
          languageScoreScaled: scaled.language,
          readingScoreScaled: scaled.reading,
          listeningScoreScaled: scaled.listening,
          totalScoreScaled: totalScaled,
          passMock,
        },
      }),
      this.prisma.jlptMockAttemptSection.updateMany({
        where: { attemptId: attempt.id, status: { in: ['ACTIVE', 'LOCKED'] } },
        data: { status: 'FINISHED', endedAt: now, endsAt: null },
      }),
    ]);

    return this.getAttemptResult(attemptId, requesterId);
  }

  async getAttemptResult(attemptId: string, requesterId?: string) {
    const attempt = await this.prisma.jlptMockAttempt.findUnique({
      where: { id: attemptId },
      include: {
        template: { include: { level: true } },
        answers: {
          include: {
            templateQuestion: {
              include: {
                question: { include: { options: true } },
                section: true,
                mondai: true,
              },
            },
            selectedOption: true,
          },
        },
      },
    });
    if (!attempt) throw new NotFoundException('Attempt not found');
    if (requesterId && requesterId !== attempt.userId)
      throw new ForbiddenException('Not allowed');
    if (attempt.status !== 'SUBMITTED')
      throw new BadRequestException('Result is not available yet');

    const showReview = attempt.template.showDetailedReview;
    const showCorrect = attempt.template.showCorrectAnswerImmediately;

    const answers = attempt.answers.map((a) => {
      const q = a.templateQuestion.question;
      const correctOption = q.options.find((o) => o.isCorrect);
      return {
        templateQuestionId: a.templateQuestionId,
        questionId: a.questionId,
        section: {
          id: a.templateQuestion.section.id,
          orderIndex: a.templateQuestion.section.orderIndex,
          code: a.templateQuestion.section.code,
        },
        mondai: a.templateQuestion.mondai
          ? {
              id: a.templateQuestion.mondai.id,
              code: a.templateQuestion.mondai.code,
              titleVi: a.templateQuestion.mondai.titleVi,
            }
          : null,
        selectedOptionId: a.selectedOptionId,
        isCorrect: a.isCorrect,
        scoreAwarded: a.scoreAwarded,
        review: showReview
          ? {
              stemText: q.stemText,
              contextText: q.contextText,
              explanation: q.explanation,
              options: q.options
                .sort((x, y) => x.orderIndex - y.orderIndex)
                .map((o) => ({
                  id: o.id,
                  key: o.key,
                  contentText: o.contentText,
                  isCorrect: showCorrect ? o.isCorrect : undefined,
                })),
              correctOptionId: showCorrect ? correctOption?.id : undefined,
            }
          : null,
      };
    });

    return {
      attempt: {
        id: attempt.id,
        templateId: attempt.templateId,
        level: attempt.template.level.code,
        status: attempt.status,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
      },
      scores: {
        languageRaw: attempt.languageScoreRaw,
        readingRaw: attempt.readingScoreRaw,
        listeningRaw: attempt.listeningScoreRaw,
        languageScaled: attempt.languageScoreScaled,
        readingScaled: attempt.readingScoreScaled,
        listeningScaled: attempt.listeningScoreScaled,
        totalScaled: attempt.totalScoreScaled,
        passMock: attempt.passMock,
      },
      answers,
    };
  }

  // -------------------------
  // History (learner)
  // -------------------------
  async findAttemptHistory(requesterId: string, limit = 20) {
    return this.prisma.jlptMockAttempt.findMany({
      where: { userId: requesterId },
      orderBy: [{ startedAt: 'desc' }],
      take: limit,
      include: {
        template: { select: { id: true, code: true, title: true } },
      },
    });
  }

  async getAttemptAnswers(attemptId: string, requesterId?: string) {
    const attempt = await this.prisma.jlptMockAttempt.findUnique({
      where: { id: attemptId },
      select: { userId: true, status: true },
    });

    if (!attempt) throw new NotFoundException('Attempt not found');
    if (requesterId && requesterId !== attempt.userId) throw new ForbiddenException('Not allowed');

    return this.prisma.jlptMockAnswer.findMany({
      where: { attemptId },
      select: {
        templateQuestionId: true,
        selectedOptionId: true,
        answeredAt: true,
      },
      orderBy: [{ answeredAt: 'asc' }],
    });
  }

  // -------------------------
  // helpers
  // -------------------------

  private _defaultSections(levelCode: 'N5' | 'N4' | 'N3' | 'N2' | 'N1') {
    // Official JLPT test times (JLPT guideline)
    if (levelCode === 'N5') {
      return [
        { code: 'LANGUAGE_VOCAB', title: 'Language Knowledge (Vocabulary)', durationMinutes: 20, orderIndex: 1, isListening: false },
        { code: 'LANGUAGE_GRAMMAR_READING', title: 'Language Knowledge (Grammar) · Reading', durationMinutes: 40, orderIndex: 2, isListening: false },
        { code: 'LISTENING', title: 'Listening', durationMinutes: 30, orderIndex: 3, isListening: true },
      ];
    }
    if (levelCode === 'N4') {
      return [
        { code: 'LANGUAGE_VOCAB', title: 'Language Knowledge (Vocabulary)', durationMinutes: 25, orderIndex: 1, isListening: false },
        { code: 'LANGUAGE_GRAMMAR_READING', title: 'Language Knowledge (Grammar) · Reading', durationMinutes: 55, orderIndex: 2, isListening: false },
        { code: 'LISTENING', title: 'Listening', durationMinutes: 35, orderIndex: 3, isListening: true },
      ];
    }
    if (levelCode === 'N3') {
      return [
        { code: 'LANGUAGE_VOCAB', title: 'Language Knowledge (Vocabulary)', durationMinutes: 30, orderIndex: 1, isListening: false },
        { code: 'LANGUAGE_GRAMMAR_READING', title: 'Language Knowledge (Grammar) · Reading', durationMinutes: 70, orderIndex: 2, isListening: false },
        { code: 'LISTENING', title: 'Listening', durationMinutes: 40, orderIndex: 3, isListening: true },
      ];
    }
    if (levelCode === 'N2') {
      return [
        { code: 'LANGUAGE_GRAMMAR_READING', title: 'Language Knowledge (Vocabulary/Grammar) · Reading', durationMinutes: 105, orderIndex: 1, isListening: false },
        { code: 'LISTENING', title: 'Listening', durationMinutes: 50, orderIndex: 2, isListening: true },
      ];
    }
    return [
      { code: 'LANGUAGE_GRAMMAR_READING', title: 'Language Knowledge (Vocabulary/Grammar) · Reading', durationMinutes: 110, orderIndex: 1, isListening: false },
      { code: 'LISTENING', title: 'Listening', durationMinutes: 55, orderIndex: 2, isListening: true },
    ];
  }

  private _domainForQuestion(question: { questionType: string }) {
    if (question.questionType === 'LISTENING') return 'LISTENING' as const;
    if (question.questionType === 'READING') return 'READING' as const;
    return 'LANGUAGE' as const;
  }

  private _mapScaled(
    mappings: Array<{ domain: any; rawScore: number; scaledScore: number }>,
    domain: 'LANGUAGE' | 'READING' | 'LISTENING',
    raw: number,
    maxRaw: number,
  ) {
    const rawInt = Math.floor(raw);
    const exact = mappings.find((m) => m.domain === domain && m.rawScore === rawInt);
    if (exact) return exact.scaledScore;
    if (maxRaw <= 0) return 0;
    return Math.max(0, Math.min(60, Math.round((raw / maxRaw) * 60)));
  }

  private _isPass(
    profile: {
      minLanguageScaled: number | null;
      minReadingScaled: number | null;
      minListeningScaled: number | null;
      minTotalScaled: number | null;
    },
    languageScaled: number,
    readingScaled: number,
    listeningScaled: number,
    totalScaled: number,
  ) {
    const minLang = profile.minLanguageScaled ?? 0;
    const minRead = profile.minReadingScaled ?? 0;
    const minListen = profile.minListeningScaled ?? 0;
    const minTotal = profile.minTotalScaled ?? 0;

    return (
      languageScaled >= minLang &&
      readingScaled >= minRead &&
      listeningScaled >= minListen &&
      totalScaled >= minTotal
    );
  }
}

