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
  constructor(private readonly prisma: PrismaService) { }

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
      },
    });
    if (!attempt) throw new NotFoundException('ExamAttempt not found');
    if (attempt.status !== 'IN_PROGRESS') return attempt;

    const questions = attempt.exam.examQuestions.map((eq) => eq.question);
    const draftAnswers = (attempt.draftAnswers as Record<string, any>) || {};

    let rawScore = 0;
    let totalPossible = questions.length; // Simplified: 1 point per question
    let hasSubjective = false;

    for (const q of questions) {
      if (q.questionType === 'ESSAY' || q.questionType === 'ORAL') {
        hasSubjective = true;
        continue;
      }

      const userAnswer = draftAnswers[q.id];
      const correctAnswer = q.correctAnswer;

      if (userAnswer !== undefined && JSON.stringify(userAnswer) === JSON.stringify(correctAnswer)) {
        rawScore += 1;
      }
    }

    const percentage = totalPossible > 0 ? (rawScore / totalPossible) * 100 : 0;
    const isPassed = percentage >= 50; // Default threshold

    return this.prisma.examAttempt.update({
      where: { id: input.attemptId },
      data: {
        status: hasSubjective ? 'SUBMITTED' : 'GRADED',
        submittedAt: new Date(),
        completedAt: new Date(),
        percentage: new Prisma.Decimal(percentage),
        rawScore: new Prisma.Decimal(rawScore),
        maxScore: new Prisma.Decimal(totalPossible),
        isPassed,
      } as any,
    });
  }
}

