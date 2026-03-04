import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { Flashcard, Prisma } from '@prisma/generated';
import type { IFlashcardRepository } from '@server/learning/interfaces/repositories/i-flashcard.repository';

@Injectable()
export class FlashcardRepository implements IFlashcardRepository {
    private readonly logger = new Logger(FlashcardRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    async findById(id: string): Promise<Flashcard | null> {
        return this.prisma.flashcard.findUnique({
            where: { id },
        });
    }

    async findAll(options: {
        skip: number;
        take: number;
        where?: Prisma.FlashcardWhereInput;
        orderBy?: Prisma.FlashcardOrderByWithRelationInput;
        include?: Prisma.FlashcardInclude;
    }): Promise<Flashcard[]> {
        return this.prisma.flashcard.findMany({
            where: options.where,
            skip: options.skip,
            take: options.take,
            orderBy: options.orderBy || { createdAt: 'desc' },
            include: options.include,
        });
    }

    async count(where?: Prisma.FlashcardWhereInput): Promise<number> {
        return this.prisma.flashcard.count({ where });
    }

    async create(data: Prisma.FlashcardCreateInput): Promise<Flashcard> {
        return this.prisma.flashcard.create({ data });
    }

    async update(id: string, data: Prisma.FlashcardUpdateInput): Promise<Flashcard> {
        return this.prisma.flashcard.update({
            where: { id },
            data: {
                ...data,
                updatedAt: new Date(),
            },
        });
    }

    async delete(id: string): Promise<void> {
        await this.prisma.flashcard.delete({
            where: { id },
        });
    }

    async deleteMany(where: Prisma.FlashcardWhereInput): Promise<{ count: number }> {
        return this.prisma.flashcard.deleteMany({ where });
    }
}

