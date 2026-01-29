import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { Question, Prisma } from '@prisma/generated';
import type { IQuestionRepository } from '../../interfaces/repositories/i-question.repository';

/**
 * Question Repository
 * Handles all database operations for Question entity
 */
@Injectable()
export class QuestionRepository implements IQuestionRepository {
    private readonly logger = new Logger(QuestionRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Find question by ID
     */
    async findById(questionId: string): Promise<Question | null> {
        return this.prisma.question.findUnique({
            where: { id: questionId },
        });
    }

    /**
     * Find all questions with pagination and filtering
     */
    async findMany(options: {
        skip: number;
        take: number;
        where?: Prisma.QuestionWhereInput;
        orderBy?: Prisma.QuestionOrderByWithRelationInput;
    }): Promise<Question[]> {
        return this.prisma.question.findMany({
            skip: options.skip,
            take: options.take,
            where: options.where,
            orderBy: options.orderBy || { createdAt: 'desc' },
        });
    }

    /**
     * Count questions with optional filter
     */
    async count(where?: Prisma.QuestionWhereInput): Promise<number> {
        return this.prisma.question.count({ where });
    }

    /**
     * Create new question
     */
    async create(data: Prisma.QuestionUncheckedCreateInput): Promise<Question> {
        return this.prisma.question.create({ data });
    }

    /**
     * Create multiple questions (bulk)
     */
    async createMany(data: Prisma.QuestionCreateManyInput[]): Promise<{ count: number }> {
        return this.prisma.question.createMany({
            data,
            skipDuplicates: true,
        });
    }

    /**
     * Update question by ID
     */
    async update(questionId: string, data: Prisma.QuestionUpdateInput): Promise<Question> {
        return this.prisma.question.update({
            where: { id: questionId },
            data,
        });
    }

    /**
     * Update multiple questions (bulk)
     */
    async updateMany(where: Prisma.QuestionWhereInput, data: Prisma.QuestionUpdateInput): Promise<{ count: number }> {
        return this.prisma.question.updateMany({
            where,
            data,
        });
    }

    /**
     * Delete question (hard delete)
     */
    async delete(questionId: string): Promise<void> {
        await this.prisma.question.delete({
            where: { id: questionId },
        });
    }

    /**
     * Delete multiple questions (bulk)
     */
    async deleteMany(where: Prisma.QuestionWhereInput): Promise<{ count: number }> {
        return this.prisma.question.deleteMany({ where });
    }

    /**
     * Find questions by category
     */
    async findByCategory(category: string): Promise<Question[]> {
        return this.prisma.question.findMany({
            where: { category },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Find questions by JLPT level
     */
    async findByJlptLevel(jlptLevel: string): Promise<Question[]> {
        return this.prisma.question.findMany({
            where: { jlptLevel },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Find questions by status
     */
    async findByStatus(status: string): Promise<Question[]> {
        return this.prisma.question.findMany({
            where: { status },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Find questions by pool
     */
    async findByPool(poolId: string): Promise<Question[]> {
        return this.prisma.question.findMany({
            where: { poolId },
            orderBy: { createdAt: 'desc' },
        });
    }

    /**
     * Update question usage count
     */
    async incrementUsageCount(questionId: string): Promise<Question> {
        return this.prisma.question.update({
            where: { id: questionId },
            data: {
                usageCount: { increment: 1 },
            },
        });
    }

    /**
     * Find random questions
     */
    async findRandom(count: number, where?: Prisma.QuestionWhereInput): Promise<Question[]> {
        // Note: This is specific to PostgreSQL
        // For a more database-agnostic approach, we would need to count records and generate random offsets,
        // but that is less efficient.

        // We need to construct the WHERE clause manually for raw query or just fetch IDs and shuffle in memory 
        // if the dataset is small. For a proper placement test with potentially many questions, 
        // SQL level randomization is better.

        // However, Prisma's $queryRawUnsafe maps to raw DB results which might result in case issues 
        // (Postgres returns lowercase columns) if not careful, or date parsing issues.
        // A safer "Prisma" way for random sampling without raw SQL risk:
        // 1. Fetch all IDs matching the criteria (lightweight)
        // 2. Shuffle locally
        // 3. Take N IDs
        // 4. Fetch details

        const questions = await this.prisma.question.findMany({
            where: where,
            select: { id: true },
        });

        const shuffled = questions.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, count);
        const ids = selected.map(q => q.id);

        if (ids.length === 0) return [];

        // We fetch again to get full objects with correct types
        return this.prisma.question.findMany({
            where: { id: { in: ids } },
        });
    }
}

