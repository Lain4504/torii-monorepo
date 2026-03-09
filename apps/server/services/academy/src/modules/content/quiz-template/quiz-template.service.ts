import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { Prisma } from '@prisma/generated';
import {
  QuizTemplateCreateDto,
  QuizTemplateQueryDto,
  QuizTemplateUpdateDto,
} from './dto/quiz-template.dto';

@Injectable()
export class QuizTemplateService {
  constructor(private readonly prisma: PrismaService) {}

  private extractDefaultExamId(settings: unknown): string | null {
    if (!settings || typeof settings !== 'object') return null;
    const value = (settings as Record<string, unknown>).defaultExamId;
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
  }

  private async validateDefaultExam(
    courseProfileId: string,
    settings: unknown,
  ) {
    const examId = this.extractDefaultExamId(settings);
    if (!examId) return;
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      select: { id: true, courseProfileId: true, status: true },
    });
    if (!exam) throw new BadRequestException('Invalid settings.defaultExamId');
    if (exam.courseProfileId !== courseProfileId) {
      throw new BadRequestException(
        'settings.defaultExamId does not belong to quiz template courseProfile',
      );
    }
    if (exam.status !== 'PUBLISHED') {
      throw new BadRequestException(
        'settings.defaultExamId must be a PUBLISHED exam',
      );
    }
  }

  async findAll(query: QuizTemplateQueryDto) {
    return this.prisma.quizTemplate.findMany({
      where: { courseProfileId: query.courseProfileId ?? undefined },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async findById(id: string) {
    const item = await this.prisma.quizTemplate.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('QuizTemplate not found');
    return item;
  }

  async create(input: QuizTemplateCreateDto) {
    const profile = await this.prisma.courseProfile.findUnique({
      where: { id: input.courseProfileId },
      select: { id: true },
    });
    if (!profile) throw new BadRequestException('Invalid courseProfileId');
    await this.validateDefaultExam(input.courseProfileId, input.settings);

    return this.prisma.quizTemplate.create({
      data: {
        courseProfileId: input.courseProfileId,
        title: input.title,
        description: input.description,
        questionPoolId: input.questionPoolId,
        defaultTimeLimitMinutes: input.defaultTimeLimitMinutes,
        defaultMaxAttempts: input.defaultMaxAttempts,
        defaultPassingScorePercent:
          input.defaultPassingScorePercent !== undefined
            ? new Prisma.Decimal(input.defaultPassingScorePercent)
            : undefined,
        settings: input.settings ?? undefined,
      } as any,
    });
  }

  async update(id: string, input: QuizTemplateUpdateDto) {
    const existing = await this.findById(id);
    await this.validateDefaultExam(
      existing.courseProfileId,
      input.settings ?? existing.settings,
    );
    return this.prisma.quizTemplate.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        questionPoolId: input.questionPoolId,
        defaultTimeLimitMinutes: input.defaultTimeLimitMinutes,
        defaultMaxAttempts: input.defaultMaxAttempts,
        defaultPassingScorePercent:
          input.defaultPassingScorePercent !== undefined
            ? new Prisma.Decimal(input.defaultPassingScorePercent)
            : undefined,
        settings: input.settings ?? undefined,
      } as any,
    });
  }

  async getUsage(id: string) {
    const chapterItems = await this.prisma.chapterItem.findMany({
      where: { kind: 'QUIZ_TEMPLATE', referenceId: id },
      include: {
        chapter: {
          include: { courseEdition: { include: { courseProfile: true } } },
        },
      },
    });

    const assessments = await this.prisma.classAssessment.findMany({
      where: { quizTemplateId: id },
      include: { class: true },
    });

    return {
      chapterItems: chapterItems.map((ci) => ({
        chapterTitle: ci.chapter.title,
        editionId: ci.chapter.courseEditionId,
        editionStatus: ci.chapter.courseEdition.status,
      })),
      assessments: assessments.map((a) => ({
        classTitle: a.class.name,
        status: a.status,
      })),
    };
  }

  async delete(id: string) {
    const usage = await this.getUsage(id);

    const publishedUsage = usage.chapterItems.filter(
      (u) => u.editionStatus === 'PUBLISHED',
    );
    if (publishedUsage.length > 0) {
      throw new BadRequestException(
        'Cannot delete quiz template used in PUBLISHED editions',
      );
    }

    const activeAssessments = usage.assessments.filter(
      (a) => a.status !== 'CLOSED',
    );
    if (activeAssessments.length > 0) {
      throw new BadRequestException(
        'Cannot delete quiz template used in active class assessments',
      );
    }

    await this.prisma.$transaction([
      this.prisma.chapterItem.deleteMany({
        where: { kind: 'QUIZ_TEMPLATE', referenceId: id },
      }),
      this.prisma.quizTemplate.delete({ where: { id } }),
    ]);
    return { ok: true };
  }
}
