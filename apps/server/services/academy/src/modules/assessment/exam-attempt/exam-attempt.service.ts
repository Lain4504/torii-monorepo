import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/generated';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
  ExamAttemptQueryDto,
  ExamAttemptSaveAnswersDto,
  ExamAttemptStartDto,
  ExamAttemptSubmitDto,
} from './dto/exam-attempt.dto';

@Injectable()
export class ExamAttemptService {
  constructor(private readonly prisma: PrismaService) {}

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

    // Create attempt + section states (locked by default; first section unlocked/in_progress)
    const sortedSections = [...exam.sections].sort((a, b) => a.orderIndex - b.orderIndex);
    const firstSectionId = sortedSections[0]?.id;

    return this.prisma.examAttempt.create({
      data: {
        examId: input.examId,
        classId: input.classId,
        userId: input.userId,
        classAssessmentId: input.classAssessmentId,
        status: 'IN_PROGRESS',
        maxScore: null,
        sections: {
          create: sortedSections.map((s) => ({
            sectionId: s.id,
            status: s.id === firstSectionId ? 'IN_PROGRESS' : 'LOCKED',
            startedAt: s.id === firstSectionId ? new Date() : null,
          })),
        },
      },
      include: { sections: true },
    });
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

  async submit(input: ExamAttemptSubmitDto) {
    const attempt = await this.findById(input.attemptId);
    if (attempt.status !== 'IN_PROGRESS') return attempt;

    // TODO: full grading logic (auto-grade objective types, compute per-section score, etc.)
    // For now, mark SUBMITTED and store timestamps.
    return this.prisma.examAttempt.update({
      where: { id: input.attemptId },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        completedAt: new Date(),
        percentage: null,
        rawScore: null,
        isPassed: null,
      } as Prisma.ExamAttemptUpdateInput,
    });
  }
}

