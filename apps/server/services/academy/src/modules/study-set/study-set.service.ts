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
                _count: { select: { setCards: true } },
            },
        });
    }

    async findAllSets(userId: string) {
        return this.prisma.studySet.findMany({
            where: { userId },
            include: {
                _count: { select: { setCards: true } },
            },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async findSetById(id: string, userId: string) {
        const set = await this.prisma.studySet.findFirst({
            where: { id, userId },
            include: {
                setCards: {
                    orderBy: { createdAt: 'desc' },
                },
                _count: { select: { setCards: true } },
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
            card.srsState as any,
            card.interval,
            data.quality
        );

        return this.prisma.setCard.update({
            where: { id: cardId },
            data: {
                ...srsUpdates,
            },
        });
    }

    // --- Extra Study Modes ---

    async getTestQuiz(setId: string, userId: string, count: number = 20, types: string = 'multiple_choice,true_false') {
        const set = await this.findSetById(setId, userId);
        const cards = set.setCards;

        if (cards.length < 4) {
            throw new Error('Cần ít nhất 4 thẻ trong bộ để tạo Test Mode');
        }

        const selectedTypes = types.split(',');
        const numItems = Math.min(count, cards.length);
        const shuffledCards = [...cards].sort(() => 0.5 - Math.random()).slice(0, numItems);

        const questions = shuffledCards.map(card => {
            const type = selectedTypes[Math.floor(Math.random() * selectedTypes.length)];

            if (type === 'multiple_choice') {
                // Get 3 random distractors
                const distractors = cards
                    .filter(c => c.id !== card.id)
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 3)
                    .map(c => c.definition);

                const options = [...distractors, card.definition].sort(() => 0.5 - Math.random());

                return {
                    id: card.id,
                    type: 'multiple_choice',
                    question: card.term,
                    options,
                    correctAnswer: card.definition
                };
            } else {
                // true_false
                const isTrue = Math.random() > 0.5;
                const falseAnswer = cards
                    .filter(c => c.id !== card.id)
                    .sort(() => 0.5 - Math.random())[0]?.definition || 'Sai';

                return {
                    id: card.id,
                    type: 'true_false',
                    question: card.term,
                    displayedAnswer: isTrue ? card.definition : falseAnswer,
                    correctAnswer: isTrue
                };
            }
        });

        return questions;
    }

    async getMatchGame(setId: string, userId: string, count: number = 6) {
        const set = await this.findSetById(setId, userId); // check exists/ownership
        const cards = await this.prisma.setCard.findMany({
            where: { studySetId: setId },
        });

        if (cards.length < 2) {
            throw new Error('Cần ít nhất 2 thẻ trong bộ để tạo Match Game');
        }

        const numItems = Math.min(count, cards.length);
        const selectedCards = [...cards].sort(() => 0.5 - Math.random()).slice(0, numItems);

        const pairs = selectedCards.map(card => ({
            id: card.id,
            term: card.term,
            definition: card.definition
        }));

        return pairs;
    }
}
