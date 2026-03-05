import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/generated';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
  ClassAssessmentCreateDto,
  ClassAssessmentQueryDto,
  ClassAssessmentUpdateDto,
} from './dto/class-assessment.dto';

@Injectable()
export class ClassAssessmentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ClassAssessmentQueryDto) {
    return this.prisma.classAssessment.findMany({
      where: { classId: query.classId ?? undefined },
      orderBy: [{ createdAt: 'asc' }],
    });
  }

  async findById(id: string) {
    const item = await this.prisma.classAssessment.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('ClassAssessment not found');
    return item;
  }

  async create(input: ClassAssessmentCreateDto) {
    const klass = await this.prisma.class.findUnique({
      where: { id: input.classId },
      select: { id: true },
    });
    if (!klass) throw new BadRequestException('Invalid classId');

    const kind = input.kind.toUpperCase();
    if (kind === 'QUIZ') {
      if (!input.quizTemplateId) throw new BadRequestException('quizTemplateId is required for QUIZ');
    }
    if (kind === 'ASSIGNMENT') {
      if (!input.assignmentTemplateId) {
        throw new BadRequestException('assignmentTemplateId is required for ASSIGNMENT');
      }
    }

    return this.prisma.classAssessment.create({
      data: {
        classId: input.classId,
        kind: input.kind,
        quizTemplateId: input.quizTemplateId,
        assignmentTemplateId: input.assignmentTemplateId,
        titleOverride: input.titleOverride,
        deadline: input.deadline,
        weight: input.weight !== undefined ? new Prisma.Decimal(input.weight) : undefined,
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
    await this.findById(id);
    return this.prisma.classAssessment.update({
      where: { id },
      data: {
        titleOverride: input.titleOverride,
        deadline: input.deadline,
        weight: input.weight !== undefined ? new Prisma.Decimal(input.weight) : undefined,
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

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.classAssessment.delete({ where: { id } });
    return { ok: true };
  }
}

