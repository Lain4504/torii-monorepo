import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import {
    CreateStudySetDto,
    UpdateStudySetDto,
    CreateSetCardDto,
    UpdateSetCardDto,
    ReviewSetCardDto,
} from './study-set.dto';
import { calculateSrsInterval } from './srs.utils';

@Injectable()
export class StudySetService {
    constructor(private readonly prisma: PrismaService) { }

    // --- Study Set Methods ---

    async createSet(userId: string, data: CreateStudySetDto) {
        return this.prisma.studySet.create({
            data: {
                ...data,
                userId,
            },
            include: {
                _count: { select: { cards: true } },
            },
        });
    }

    async findAllSets(userId: string) {
        return this.prisma.studySet.findMany({
            where: { userId },
            include: {
                _count: { select: { cards: true } },
            },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async findSetById(id: string, userId: string) {
        const set = await this.prisma.studySet.findFirst({
            where: { id, userId },
            include: {
                cards: {
                    orderBy: { createdAt: 'desc' },
                },
                _count: { select: { cards: true } },
            },
        });
        if (!set) throw new NotFoundException('Study Set not found');
        return set;
    }

    async updateSet(id: string, userId: string, data: UpdateStudySetDto) {
        await this.findSetById(id, userId); // check exists
        return this.prisma.studySet.update({
            where: { id },
            data,
        });
    }

    async deleteSet(id: string, userId: string) {
        await this.findSetById(id, userId); // check exists
        return this.prisma.studySet.delete({
            where: { id },
        });
    }

    // --- Set Card Methods ---

    async createCard(setId: string, userId: string, data: CreateSetCardDto) {
        await this.findSetById(setId, userId); // verify ownership
        return this.prisma.setCard.create({
            data: {
                ...data,
                studySetId: setId,
                nextReviewAt: new Date(), // Due immediately
            },
        });
    }

    async updateCard(cardId: string, userId: string, data: UpdateSetCardDto) {
        const card = await this.prisma.setCard.findFirst({
            where: { id: cardId, studySet: { userId } },
        });
        if (!card) throw new NotFoundException('Card not found');

        return this.prisma.setCard.update({
            where: { id: cardId },
            data,
        });
    }

    async deleteCard(cardId: string, userId: string) {
        const card = await this.prisma.setCard.findFirst({
            where: { id: cardId, studySet: { userId } },
        });
        if (!card) throw new NotFoundException('Card not found');

        return this.prisma.setCard.delete({
            where: { id: cardId },
        });
    }

    // --- Study Flow / SRS ---

    async getStudyCards(setId: string, userId: string) {
        await this.findSetById(setId, userId);

        // Fetch cards that are due for review (nextReviewAt <= now)
        // Or new cards (never reviewed) -> they have default state/nextReviewAt
        return this.prisma.setCard.findMany({
            where: {
                studySetId: setId,
                nextReviewAt: { lte: new Date() },
            },
            orderBy: {
                nextReviewAt: 'asc',
            },
        });
    }

    async reviewCard(cardId: string, userId: string, data: ReviewSetCardDto) {
        const card = await this.prisma.setCard.findFirst({
            where: { id: cardId, studySet: { userId } },
        });
        if (!card) throw new NotFoundException('Card not found');

        const srsUpdates = calculateSrsInterval(
            card.srsState as 'NEW' | 'LEARNING' | 'REVIEW' | 'GRADUATED',
            card.interval,
            data.rating
        );

        return this.prisma.setCard.update({
            where: { id: cardId },
            data: {
                ...srsUpdates,
                lastReviewedAt: new Date(),
            },
        });
    }
}
