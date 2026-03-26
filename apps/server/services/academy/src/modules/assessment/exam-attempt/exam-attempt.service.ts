import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import {
  AcademyExamAttemptStartDTO,
  AcademyExamAttemptSaveAnswersDTO,
  AcademyAttemptStatus,
  AcademyExamStatus,
  AcademyExamAttemptQueryDTO,
} from '@workspace/schemas';
import { ExamService } from '../exam/exam.service';

@Injectable()
export class ExamAttemptService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly examService: ExamService,
  ) {}

  async startAttempt(dto: AcademyExamAttemptStartDTO) {
    const { examId, userId, enrollmentId, classId } = dto;

    // Check exam exists and published
    const exam = await this.prisma.academyExam.findUnique({
      where: { id: examId },
    });
    if (!exam || exam.status !== (AcademyExamStatus.PUBLISHED as any)) {
      throw new NotFoundException('Exam not found or not published');
    }

    // Check for existing active attempt (prevent duplicate starts)
    const existing = await this.prisma.academyExamAttempt.findFirst({
      where: {
        userId,
        examId,
        status: AcademyAttemptStatus.IN_PROGRESS as any,
      },
      include: { exam: true },
    });
    if (existing) return this.attachComputedFields(existing);

    const created = await this.prisma.academyExamAttempt.create({
      data: {
        examId,
        userId: userId!,
        enrollmentId,
        classId,
        status: AcademyAttemptStatus.IN_PROGRESS as any,
      },
      include: { exam: true },
    });
    return this.attachComputedFields(created);
  }

  async saveDraft(dto: AcademyExamAttemptSaveAnswersDTO) {
    return this.prisma.academyExamAttempt.update({
      where: { id: dto.attemptId },
      data: {
        draftAnswers: dto.draftAnswers as any,
      },
    });
  }

  async submitAttempt(attemptId: string) {
    const attempt = await this.prisma.academyExamAttempt.findUnique({
      where: { id: attemptId },
      include: {
        exam: {
          include: {
            sections: {
              include: {
                questions: {
                  include: {
                    question: {
                      include: {
                        options: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!attempt) throw new NotFoundException('Attempt not found');
    if (attempt.status !== (AcademyAttemptStatus.IN_PROGRESS as any)) {
      throw new BadRequestException('Attempt already submitted or cancelled');
    }

    const draftAnswers = (attempt.draftAnswers || {}) as Record<string, any>;
    let totalScore = 0;
    let maxPossibleScore = 0;
    const itemRecords: any[] = [];

    // Calculate score
    for (const section of attempt.exam.sections) {
      for (const examQ of section.questions) {
        const question = examQ.question;
        const userAnswer = draftAnswers[examQ.id];
        const points = Number(examQ.points || 0);
        maxPossibleScore += points;

        let isCorrect = false;
        let scoreAwarded = 0;

        if (userAnswer) {
          // Simplistic logic for SINGLE_CHOICE for now
          // In real scenarios, support more types
          if (typeof userAnswer === 'string') { // optionKey or OptionId
             const selectedOption = question.options.find(o => o.id === userAnswer || o.optionKey === userAnswer);
             if (selectedOption?.isCorrect) {
               isCorrect = true;
               scoreAwarded = points;
             }
          }
        }

        itemRecords.push({
          attemptId,
          examQuestionId: examQ.id,
          questionId: question.id,
          selectedOptionId: (typeof userAnswer === 'string' && userAnswer.length > 20) ? userAnswer : undefined,
          answerPayload: userAnswer as any,
          isCorrect,
          scoreAwarded,
        });

        totalScore += scoreAwarded;
      }
    }

    const percentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
    const settings = (attempt.exam.settings || {}) as any;
    const passThreshold = settings.passThreshold || 50; // default 50%
    const isPassed = percentage >= passThreshold;

    return this.prisma.$transaction(async (tx) => {
      // Save detailed answers
      await tx.academyExamAttemptAnswer.createMany({
        data: itemRecords,
      });

      // Update attempt status
      return tx.academyExamAttempt.update({
        where: { id: attemptId },
        data: {
          status: AcademyAttemptStatus.SUBMITTED as any,
          score: totalScore,
          maxScore: maxPossibleScore,
          percentage: percentage,
          isPassed,
          submittedAt: new Date(),
          completedAt: new Date(),
        },
      });
    });
  }

  async getAttemptDetail(id: string) {
    const attempt = await this.prisma.academyExamAttempt.findUnique({
      where: { id },
      include: {
        answers: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
        },
        exam: true,
      },
    });
    if (!attempt) throw new NotFoundException('Attempt not found');

    const details = attempt.answers.map((ans) => {
      const options: Record<string, string> = {};
      ans.question.options.forEach((o) => {
        options[o.optionKey] = o.content;
      });

      // Find the user answer key (either by ID match or by payload key)
      const userOpt = ans.question.options.find(
        (o) => o.id === ans.selectedOptionId,
      );
      const userKey =
        userOpt?.optionKey ||
        (typeof ans.answerPayload === 'string' ? ans.answerPayload : '');

      // Find correct answer key
      const correctOpt = ans.question.options.find((o) => o.isCorrect);
      const correctKey = correctOpt?.optionKey;

      return {
        id: ans.id,
        questionText: ans.question.stem,
        options: options,
        userAnswer: userKey,
        correctAnswer: correctKey,
        isCorrect: ans.isCorrect,
        pointsEarned: Number(ans.scoreAwarded || 0),
        explanation: ans.question.explanation,
      };
    });

    return {
      ...this.attachComputedFields(attempt),
      details,
    };
  }

  private attachComputedFields(attempt: any) {
    if (!attempt) return attempt;

    const timeTakenSeconds =
      attempt.submittedAt && attempt.startedAt
        ? Math.floor(
            (attempt.submittedAt.getTime() - attempt.startedAt.getTime()) / 1000,
          )
        : undefined;

    let deadlineAt: Date | undefined = undefined;
    if (
      attempt.exam &&
      attempt.exam.totalTimeLimitMinutes &&
      attempt.startedAt
    ) {
      deadlineAt = new Date(
        attempt.startedAt.getTime() +
          attempt.exam.totalTimeLimitMinutes * 60 * 1000,
      );
    }

    return {
      ...attempt,
      timeTakenSeconds,
      deadlineAt,
      quizTitle: attempt.exam?.title,
    };
  }

  async findAll(query: AcademyExamAttemptQueryDTO) {
    const { examId, status, userId, enrollmentId, classId, latestOnly } = query;
    const where: any = {
      examId,
      userId,
      enrollmentId,
      classId,
    };

    if (status) {
      where.status = status as any;
    }

    if (latestOnly) {
      const top = await this.prisma.academyExamAttempt.findFirst({
        where,
        orderBy: { startedAt: 'desc' },
        include: { exam: true },
      });
      if (!top) return [];
      return [this.attachComputedFields(top)];
    }

    const items = await this.prisma.academyExamAttempt.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      include: { exam: true },
    });

    return items.map((item) => this.attachComputedFields(item));
  }
}
