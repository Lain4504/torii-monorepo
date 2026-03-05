import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
    await this.findById(id);
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

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.quizTemplate.delete({ where: { id } });
    return { ok: true };
  }
}

