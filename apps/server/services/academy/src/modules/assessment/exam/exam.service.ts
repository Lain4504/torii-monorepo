import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { ExamCreateDto, ExamQueryDto, ExamUpdateDto } from './dto/exam.dto';
import { AuditLoggerService } from '../../audit-logger.service';

import { QuestionPoolService } from '../question-pool/question-pool.service';

@Injectable()
export class ExamService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly poolService: QuestionPoolService,
    private readonly audit: AuditLoggerService,
  ) { }

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

  async create(input: ExamCreateDto, requesterId = 'SYSTEM') {
    if (input.courseProfileId) {
      const profile = await this.prisma.courseProfile.findUnique({
        where: { id: input.courseProfileId },
        select: { id: true },
      });
      if (!profile) throw new BadRequestException('Invalid courseProfileId');
    }

    const result = await this.prisma.exam.create({
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

    await this.audit.log({
      userId: requesterId,
      action: 'exam.create',
      entity: 'Exam',
      entityId: result.id,
      description: `Created exam: "${result.title}"`,
      newValues: { title: result.title, examType: result.examType },
    });

    return result;
  }

  async update(id: string, input: ExamUpdateDto, requesterId = 'SYSTEM') {
    const exam = await this.findById(id);
    if (exam.status !== 'DRAFT') {
      throw new BadRequestException('Cannot update non-DRAFT exam');
    }
    const updated = await this.prisma.exam.update({
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

    await this.audit.log({
      userId: requesterId,
      action: 'exam.update',
      entity: 'Exam',
      entityId: id,
      description: `Updated exam: "${exam.title}"`,
      oldValues: { title: exam.title, status: exam.status },
      newValues: { title: updated.title, status: updated.status },
    });

    return updated;
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

  async delete(id: string, requesterId = 'SYSTEM') {
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

    await this.audit.log({
      userId: requesterId,
      action: 'exam.delete',
      entity: 'Exam',
      entityId: id,
      description: `Deleted exam: "${exam.title}"`,
      metadata: { title: exam.title, courseProfileId: exam.courseProfileId },
    });

    return { ok: true };
  }

  async addQuestionsFromPool(
    examId: string,
    sectionId: string,
    poolId: string,
    count: number,
  ) {
    const exam = await this.findById(examId);
    if (exam.status !== 'DRAFT') {
      throw new BadRequestException('Cannot add questions to non-DRAFT exam');
    }

    const section = await this.prisma.examSection.findUnique({
      where: { id: sectionId },
    });
    if (!section || section.examId !== examId) {
      throw new BadRequestException('Invalid sectionId');
    }

    // Get random questions from pool
    const samples = await this.poolService.sampleQuestions(poolId, { count });

    // Get current max order index in this section
    const lastQuestion = await this.prisma.examQuestion.findFirst({
      where: { sectionId },
      orderBy: { orderIndex: 'desc' },
      select: { orderIndex: true },
    });

    let currentOrder = (lastQuestion?.orderIndex ?? -1) + 1;

    const data = samples.map((q) => ({
      examId,
      sectionId,
      questionId: q.id,
      orderIndex: currentOrder++,
      points: 1.0, // Default points
    }));

    return this.prisma.examQuestion.createMany({
      data,
    });
  }
}

