import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import type {
    FlashcardReview,
    FlashcardReviewSession,
    FlashcardUserProgress,
    Prisma
} from '@prisma/generated';
import type { IFlashcardReviewRepository } from '../../interfaces/repositories/i-flashcard-review.repository';

@Injectable()
export class FlashcardReviewRepository implements IFlashcardReviewRepository {
    private readonly logger = new Logger(FlashcardReviewRepository.name);

    constructor(private readonly prisma: PrismaService) { }

    // Progress
    async findProgress(userId: string, flashcardId: string): Promise<FlashcardUserProgress | null> {
        return this.prisma.flashcardUserProgress.findUnique({
            where: {
                userId_flashcardId: { userId, flashcardId }
            }
        });
    }

    async findManyProgress(where: Prisma.FlashcardUserProgressWhereInput, options?: { take?: number, skip?: number, include?: Prisma.FlashcardUserProgressInclude }): Promise<FlashcardUserProgress[]> {
        return this.prisma.flashcardUserProgress.findMany({
            where,
            take: options?.take,
            skip: options?.skip,
            include: options?.include,
        });
    }

    async createProgress(data: Prisma.FlashcardUserProgressCreateInput): Promise<FlashcardUserProgress> {
        return this.prisma.flashcardUserProgress.create({ data });
    }

    async updateProgress(userId: string, flashcardId: string, data: Prisma.FlashcardUserProgressUpdateInput): Promise<FlashcardUserProgress> {
        return this.prisma.flashcardUserProgress.update({
            where: {
                userId_flashcardId: { userId, flashcardId }
            },
            data
        });
    }

    // Reviews
    async createReview(data: Prisma.FlashcardReviewCreateInput): Promise<FlashcardReview> {
        return this.prisma.flashcardReview.create({ data });
    }

    async findReviews(where: Prisma.FlashcardReviewWhereInput): Promise<FlashcardReview[]> {
        return this.prisma.flashcardReview.findMany({ where });
    }

    // Sessions
    async createSession(data: Prisma.FlashcardReviewSessionCreateInput): Promise<FlashcardReviewSession> {
        return this.prisma.flashcardReviewSession.create({ data });
    }

    async updateSession(id: string, data: Prisma.FlashcardReviewSessionUpdateInput): Promise<FlashcardReviewSession> {
        return this.prisma.flashcardReviewSession.update({
            where: { id },
            data
        });
    }

    async findSessionById(id: string): Promise<FlashcardReviewSession | null> {
        return this.prisma.flashcardReviewSession.findUnique({
            where: { id }
        });
    }

    async findManySessions(options: {
        skip: number;
        take: number;
        where?: Prisma.FlashcardReviewSessionWhereInput;
        orderBy?: Prisma.FlashcardReviewSessionOrderByWithRelationInput;
    }): Promise<FlashcardReviewSession[]> {
        return this.prisma.flashcardReviewSession.findMany({
            where: options.where,
            skip: options.skip,
            take: options.take,
            orderBy: options.orderBy || { createdAt: 'desc' },
        });
    }

    async countSessions(where?: Prisma.FlashcardReviewSessionWhereInput): Promise<number> {
        return this.prisma.flashcardReviewSession.count({ where });
    }
}
