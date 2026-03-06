import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { ExamCreateDto, ExamQueryDto, ExamUpdateDto } from './dto/exam.dto';

@Injectable()
export class ExamService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(query: ExamQueryDto) {
    return this.prisma.exam.findMany({
      where: {
        courseProfileId: query.courseProfileId ?? undefined,
        status: query.status ?? undefined,
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async findById(id: string) {
    const item = await this.prisma.exam.findUnique({
      where: { id },
      include: { sections: true, examQuestions: true },
    });
    if (!item) throw new NotFoundException('Exam not found');
    return item;
  }

  async create(input: ExamCreateDto) {
    if (input.courseProfileId) {
      const profile = await this.prisma.courseProfile.findUnique({
        where: { id: input.courseProfileId },
        select: { id: true },
      });
      if (!profile) throw new BadRequestException('Invalid courseProfileId');
    }

    return this.prisma.exam.create({
      data: {
        courseProfileId: input.courseProfileId,
        title: input.title,
        description: input.description,
        examType: input.examType ?? 'COURSE',
        level: input.level,
        totalTimeLimitMinutes: input.totalTimeLimitMinutes,
        status: input.status ?? 'DRAFT',
        settings: input.settings ?? undefined,
        sections: {
          create: input.sections.map((s) => ({
            title: s.title,
            instruction: s.instruction,
            timeLimitSeconds: s.timeLimitSeconds,
            orderIndex: s.orderIndex,
            sectionType: s.sectionType,
            metadata: s.metadata ?? undefined,
          })),
        },
      },
      include: { sections: true },
    });
  }

  async update(id: string, input: ExamUpdateDto) {
    const exam = await this.findById(id);
    if (exam.status !== 'DRAFT') {
      throw new BadRequestException('Cannot update non-DRAFT exam');
    }
    return this.prisma.exam.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        examType: input.examType,
        level: input.level,
        totalTimeLimitMinutes: input.totalTimeLimitMinutes,
        status: input.status,
        settings: input.settings ?? undefined,
      },
    });
  }

  async publishExam(id: string) {
    const exam = await this.findById(id);
    if (exam.status === 'PUBLISHED') return exam;

    // Check if sections and questions are well-defined
    if (exam.sections.length === 0) {
      throw new BadRequestException('Exam must have at least one section before publishing');
    }

    return this.prisma.exam.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });
  }

  async archiveExam(id: string) {
    const exam = await this.findById(id);
    if (exam.status === 'ARCHIVED') return exam;

    return this.prisma.exam.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });
  }

  async delete(id: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id },
      include: {
        attempts: { select: { id: true }, take: 1 },
      },
    });
    if (!exam) throw new NotFoundException('Exam not found');

    if (exam.status === 'PUBLISHED') {
      throw new BadRequestException('Cannot delete PUBLISHED exam. Archive it instead.');
    }

    if (exam.attempts.length > 0) {
      throw new BadRequestException('Cannot delete exam with existing attempts');
    }

    await this.prisma.exam.delete({ where: { id } });
    return { ok: true };
  }
}

