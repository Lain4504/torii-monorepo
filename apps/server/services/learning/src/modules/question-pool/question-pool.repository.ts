import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { QuestionPool, Prisma } from '@prisma/generated';
import type { IQuestionPoolRepository } from '@server/learning/interfaces/repositories/i-question-pool.repository';

/**
 * Question Pool Repository
 * Handles all database operations for QuestionPool entity
 */
@Injectable()
export class QuestionPoolRepository implements IQuestionPoolRepository {
  private readonly logger = new Logger(QuestionPoolRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find pool by ID
   */
  async findById(poolId: string): Promise<QuestionPool | null> {
    return this.prisma.questionPool.findUnique({
      where: { id: poolId },
      include: {
        questions: true,
      },
    });
  }

  /**
   * Find all pools with pagination and filtering
   */
  async findMany(options: {
    skip: number;
    take: number;
    where?: Prisma.QuestionPoolWhereInput;
    orderBy?: Prisma.QuestionPoolOrderByWithRelationInput;
  }): Promise<QuestionPool[]> {
    return this.prisma.questionPool.findMany({
      skip: options.skip,
      take: options.take,
      where: options.where,
      orderBy: options.orderBy || { createdAt: 'desc' },
    });
  }

  /**
   * Count pools with optional filter
   */
  async count(where?: Prisma.QuestionPoolWhereInput): Promise<number> {
    return this.prisma.questionPool.count({ where });
  }

  /**
   * Create new pool
   */
  async create(data: Prisma.QuestionPoolCreateInput): Promise<QuestionPool> {
    return this.prisma.questionPool.create({ data });
  }

  /**
   * Update pool by ID
   */
  async update(
    poolId: string,
    data: Prisma.QuestionPoolUpdateInput,
  ): Promise<QuestionPool> {
    return this.prisma.questionPool.update({
      where: { id: poolId },
      data,
    });
  }

  /**
   * Delete pool (hard delete)
   */
  async delete(poolId: string): Promise<void> {
    await this.prisma.questionPool.delete({
      where: { id: poolId },
    });
  }

  /**
   * Find pools by course
   */
  async findByCourse(courseMasterId: string): Promise<QuestionPool[]> {
    return this.prisma.questionPool.findMany({
      where: { courseMasterId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find pools by lesson
   */
  async findByLesson(lessonId: string): Promise<QuestionPool[]> {
    return this.prisma.questionPool.findMany({
      where: { lessonId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Find pools by JLPT level
   */
  async findByJlptLevel(jlptLevel: string): Promise<QuestionPool[]> {
    return this.prisma.questionPool.findMany({
      where: { jlptLevel },
      orderBy: { createdAt: 'desc' },
    });
  }
}
