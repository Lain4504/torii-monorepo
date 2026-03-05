import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { Quiz, QuizAttempt, Prisma } from '@prisma/generated';
import type { IExamRepository } from '@server/learning/interfaces/repositories/i-exam.repository';

/**
 * Exam Repository
 * Handles all database operations for Quiz/Exam entity
 */
@Injectable()
export class ExamRepository implements IExamRepository {
  private readonly logger = new Logger(ExamRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find quiz by ID
   */
  async findById(
    quizId: string,
    include?: Prisma.QuizInclude,
  ): Promise<Quiz | null> {
    return this.prisma.quiz.findUnique({
      where: { id: quizId },
      include,
    });
  }

  /**
   * Find all quizzes with pagination and filtering
   */
  async findMany(options: {
    skip: number;
    take: number;
    where?: Prisma.QuizWhereInput;
    orderBy?: Prisma.QuizOrderByWithRelationInput;
    include?: Prisma.QuizInclude;
  }): Promise<Quiz[]> {
    return this.prisma.quiz.findMany({
      where: options.where,
      skip: options.skip,
      take: options.take,
      orderBy: options.orderBy || { createdAt: 'desc' },
      include: options.include,
    });
  }

  /**
   * Count quizzes with optional filter
   */
  async count(where?: Prisma.QuizWhereInput): Promise<number> {
    return this.prisma.quiz.count({ where });
  }

  /**
   * Create new quiz
   */
  async create(data: Prisma.QuizCreateInput): Promise<Quiz> {
    return this.prisma.quiz.create({ data });
  }

  /**
   * Update quiz by ID
   */
  async update(quizId: string, data: Prisma.QuizUpdateInput): Promise<Quiz> {
    return this.prisma.quiz.update({
      where: { id: quizId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Delete quiz (hard delete)
   */
  async delete(quizId: string): Promise<void> {
    await this.prisma.quiz.delete({
      where: { id: quizId },
    });
  }

  /**
   * Find quiz attempt by ID
   */
  async findAttemptById(
    attemptId: string,
    include?: Prisma.QuizAttemptInclude,
  ): Promise<QuizAttempt | null> {
    return this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include,
    });
  }

  /**
   * Find quiz attempts with pagination and filtering
   */
  async findAttempts(options: {
    skip: number;
    take: number;
    where?: Prisma.QuizAttemptWhereInput;
    orderBy?: Prisma.QuizAttemptOrderByWithRelationInput;
    include?: Prisma.QuizAttemptInclude;
  }): Promise<QuizAttempt[]> {
    return this.prisma.quizAttempt.findMany({
      where: options.where,
      skip: options.skip,
      take: options.take,
      orderBy: options.orderBy || { createdAt: 'desc' },
      include: options.include,
    });
  }

  /**
   * Count quiz attempts with optional filter
   */
  async countAttempts(where?: Prisma.QuizAttemptWhereInput): Promise<number> {
    return this.prisma.quizAttempt.count({ where });
  }

  /**
   * Create quiz attempt
   */
  async createAttempt(
    data: Prisma.QuizAttemptCreateInput,
  ): Promise<QuizAttempt> {
    return this.prisma.quizAttempt.create({ data });
  }

  /**
   * Update quiz attempt by ID
   */
  async updateAttempt(
    attemptId: string,
    data: Prisma.QuizAttemptUpdateInput,
  ): Promise<QuizAttempt> {
    return this.prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Create quiz attempt details in batch
   */
  async createAttemptDetails(
    data: Prisma.QuizAttemptDetailCreateManyInput[],
  ): Promise<{ count: number }> {
    return this.prisma.quizAttemptDetail.createMany({ data });
  }

  /**
   * Find questions by IDs
   */
  async findQuestionsByIds(questionIds: string[]): Promise<any[]> {
    return this.prisma.question.findMany({
      where: {
        id: { in: questionIds },
        status: 'active',
      },
    });
  }

  /**
   * Find quiz questions by quiz ID
   */
  async findQuizQuestions(quizId: string): Promise<any[]> {
    return this.prisma.quizQuestion.findMany({
      where: { quizId },
    });
  }

  /**
   * Update question usage count
   */
  async incrementQuestionUsageCount(questionId: string): Promise<void> {
    await this.prisma.question.update({
      where: { id: questionId },
      data: {
        usageCount: { increment: 1 },
      },
    });
  }

  /**
   * Find questions by pool ID with optional filters, then shuffle randomly
   */
  async findQuestionsByPool(
    poolId: string,
    take: number,
    difficulty?: string,
    excludeIds?: string[],
  ): Promise<any[]> {
    const where: any = {
      poolId,
      status: 'active',
    };

    if (difficulty) {
      where.difficulty = difficulty;
    }

    if (excludeIds && excludeIds.length > 0) {
      where.id = { notIn: excludeIds };
    }

    // Fetch more than needed, then shuffle to randomize selection
    const allQuestions = await this.prisma.question.findMany({
      where,
      orderBy: [{ usageCount: 'asc' }, { createdAt: 'desc' }],
    });

    // Fisher-Yates shuffle for true randomness
    for (let i = allQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allQuestions[i], allQuestions[j]] = [allQuestions[j], allQuestions[i]];
    }

    return allQuestions.slice(0, take);
  }

  /**
   * Find attempt details with questions by attempt ID
   */
  async findAttemptDetails(attemptId: string): Promise<any[]> {
    return this.prisma.quizAttemptDetail.findMany({
      where: { attemptId },
      include: {
        question: true,
      },
    });
  }

  /**
   * Create quiz questions in batch
   */
  async createQuizQuestions(
    data: Prisma.QuizQuestionCreateManyInput[],
  ): Promise<{ count: number }> {
    return this.prisma.quizQuestion.createMany({ data });
  }

  /**
   * Get max order index for quiz questions
   */
  async getMaxQuizQuestionOrder(quizId: string): Promise<number> {
    const result = await this.prisma.quizQuestion.aggregate({
      where: { quizId },
      _max: { orderIndex: true },
    });
    return result._max.orderIndex || 0;
  }
}
