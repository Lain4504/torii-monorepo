import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type { FlashcardDeck, Prisma } from '@prisma/generated';
import type { IFlashcardDeckRepository } from '@server/learning/interfaces/repositories/i-flashcard-deck.repository';

@Injectable()
export class FlashcardDeckRepository implements IFlashcardDeckRepository {
  private readonly logger = new Logger(FlashcardDeckRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: string,
    include?: Prisma.FlashcardDeckInclude,
  ): Promise<FlashcardDeck | null> {
    return this.prisma.flashcardDeck.findUnique({
      where: { id },
      include,
    });
  }

  async findAll(options: {
    skip: number;
    take: number;
    where?: Prisma.FlashcardDeckWhereInput;
    orderBy?: Prisma.FlashcardDeckOrderByWithRelationInput;
    include?: Prisma.FlashcardDeckInclude;
  }): Promise<FlashcardDeck[]> {
    return this.prisma.flashcardDeck.findMany({
      where: options.where,
      skip: options.skip,
      take: options.take,
      orderBy: options.orderBy || { createdAt: 'desc' },
      include: options.include,
    });
  }

  async count(where?: Prisma.FlashcardDeckWhereInput): Promise<number> {
    return this.prisma.flashcardDeck.count({ where });
  }

  async create(data: Prisma.FlashcardDeckCreateInput): Promise<FlashcardDeck> {
    return this.prisma.flashcardDeck.create({ data });
  }

  async update(
    id: string,
    data: Prisma.FlashcardDeckUpdateInput,
  ): Promise<FlashcardDeck> {
    return this.prisma.flashcardDeck.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.flashcardDeck.delete({
      where: { id },
    });
  }
}
