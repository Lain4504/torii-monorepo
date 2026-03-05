import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { ExamCreateDto, ExamQueryDto, ExamUpdateDto } from './dto/exam.dto';

@Injectable()
export class ExamService {
  constructor(private readonly prisma: PrismaService) {}

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
    await this.findById(id);
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

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.exam.delete({ where: { id } });
    return { ok: true };
  }
}

