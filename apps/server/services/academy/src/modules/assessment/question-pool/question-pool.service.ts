import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
    AddPoolQuestionsDto,
    QuestionPoolCreateDto,
    QuestionPoolQueryDto,
    QuestionPoolUpdateDto,
    SampleQuestionsDto,
} from './dto/question-pool.dto';

@Injectable()
export class QuestionPoolService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(query: QuestionPoolQueryDto) {
        const q = query.q?.trim();
        return this.prisma.questionPool.findMany({
            where: {
                courseProfileId: query.courseProfileId ?? undefined,
                level: query.level ?? undefined,
                category: query.category ?? undefined,
                status: query.status ?? undefined,
                ...(q
                    ? {
                        OR: [
                            { name: { contains: q, mode: 'insensitive' } },
                            { code: { contains: q, mode: 'insensitive' } },
                        ],
                    }
                    : {}),
            },
            include: {
                _count: {
                    select: { poolQuestions: true },
                },
            },
            orderBy: [{ createdAt: 'desc' }],
        });
    }

    async findById(id: string) {
        const item = await this.prisma.questionPool.findUnique({
            where: { id },
            include: {
                poolQuestions: {
                    include: {
                        question: true,
                    },
                },
            },
        });
        if (!item) throw new NotFoundException('Question pool not found');
        return item;
    }

    async create(input: QuestionPoolCreateDto) {
        return this.prisma.questionPool.create({
            data: {
                code: input.code,
                name: input.name,
                description: input.description,
                courseProfileId: input.courseProfileId,
                level: input.level,
                category: input.category,
                status: input.status,
                metadata: input.metadata ?? undefined,
            },
        });
    }

    async update(id: string, input: QuestionPoolUpdateDto) {
        await this.findById(id);
        return this.prisma.questionPool.update({
            where: { id },
            data: {
                code: input.code,
                name: input.name,
                description: input.description,
                courseProfileId: input.courseProfileId,
                level: input.level,
                category: input.category,
                status: input.status,
                metadata: input.metadata ?? undefined,
            },
        });
    }

    async delete(id: string) {
        const pool = await this.prisma.questionPool.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { quizTemplates: true },
                },
            },
        });

        if (!pool) throw new NotFoundException('Question pool not found');

        if (pool._count.quizTemplates > 0) {
            throw new BadRequestException('Cannot delete question pool used in quiz templates');
        }

        return this.prisma.questionPool.delete({ where: { id } });
    }

    async getPoolQuestions(poolId: string) {
        return this.prisma.poolQuestion.findMany({
            where: { poolId },
            include: { question: true },
            orderBy: { orderIndex: 'asc' },
        });
    }

    async addQuestions(poolId: string, input: AddPoolQuestionsDto) {
        const data = input.questionIds.map((questionId) => ({
            poolId,
            questionId,
        }));

        // Use createMany with skipDuplicates if possible, or individual ones
        // Prisma createMany skipDuplicates is supported on PostgreSQL
        return this.prisma.poolQuestion.createMany({
            data,
            skipDuplicates: true,
        });
    }

    async removeQuestion(poolId: string, questionId: string) {
        return this.prisma.poolQuestion.delete({
            where: {
                poolId_questionId: {
                    poolId,
                    questionId,
                },
            },
        });
    }

    async sampleQuestions(poolId: string, input: SampleQuestionsDto) {
        const pool = await this.findById(poolId);
        if (pool.status !== 'ACTIVE') {
            throw new BadRequestException('Can only sample from ACTIVE pool');
        }

        // Using raw query for random limit in PostgreSQL
        return this.prisma.$queryRawUnsafe<any[]>(
            `SELECT q.* FROM academy_questions q
       JOIN academy_pool_questions pq ON q.id = pq.question_id
       WHERE pq.pool_id = $1::uuid
       ORDER BY RANDOM()
       LIMIT $2`,
            poolId,
            input.count,
        );
    }
}
