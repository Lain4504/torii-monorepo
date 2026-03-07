import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { CreateDeckDto, CreateFlashcardDto, ReviewFlashcardDto, UpdateDeckDto, UpdateFlashcardDto } from './flashcard.dto';
import { SrsState } from '@prisma/generated/enums';

@Injectable()
export class FlashcardService {
    constructor(private prisma: PrismaService) { }

    async createDeck(userId: string, dto: CreateDeckDto) {
        return this.prisma.flashcardDeck.create({
            data: {
                userId,
                name: dto.name,
                description: dto.description,
                isPublic: dto.isPublic,
            },
        });
    }

    async getMyDecks(userId: string) {
        const decks = await this.prisma.flashcardDeck.findMany({
            where: { userId },
            include: {
                _count: {
                    select: { flashcards: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return decks.map((deck) => ({
            ...deck,
            stats: {
                cardCount: deck._count.flashcards,
            },
        }));
    }

    async getDeckById(userId: string, deckId: string) {
        const deck = await this.prisma.flashcardDeck.findFirst({
            where: { id: deckId, userId },
            include: {
                flashcards: true,
                _count: {
                    select: { flashcards: true },
                },
            },
        });
        if (!deck) throw new NotFoundException('Deck not found');
        return {
            ...deck,
            stats: {
                cardCount: deck._count.flashcards,
            },
        };
    }

    async updateDeck(userId: string, deckId: string, dto: UpdateDeckDto) {
        const deck = await this.prisma.flashcardDeck.findFirst({
            where: { id: deckId, userId },
        });
        if (!deck) throw new NotFoundException('Deck not found');

        return this.prisma.flashcardDeck.update({
            where: { id: deckId },
            data: {
                name: dto.name,
                description: dto.description,
                isPublic: dto.isPublic,
            },
        });
    }

    async deleteDeck(userId: string, deckId: string) {
        const deck = await this.prisma.flashcardDeck.findFirst({
            where: { id: deckId, userId },
        });
        if (!deck) throw new NotFoundException('Deck not found');

        await this.prisma.flashcardDeck.delete({
            where: { id: deckId },
        });

        return { success: true };
    }

    async addCard(userId: string, deckId: string, dto: CreateFlashcardDto) {
        const deck = await this.prisma.flashcardDeck.findFirst({
            where: { id: deckId, userId },
        });
        if (!deck) throw new NotFoundException('Deck not found');

        const { mediaUrl, ...rest } = dto;
        return this.prisma.flashcard.create({
            data: {
                deckId,
                ...rest,
                imageUrl: mediaUrl,
            },
        });
    }

    async getDeckCards(userId: string, deckId: string) {
        const deck = await this.prisma.flashcardDeck.findFirst({
            where: { id: deckId, userId },
        });
        if (!deck) throw new NotFoundException('Deck not found');

        return this.prisma.flashcard.findMany({
            where: { deckId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateCard(userId: string, cardId: string, dto: UpdateFlashcardDto) {
        const card = await this.prisma.flashcard.findFirst({
            where: { id: cardId, deck: { userId } },
        });
        if (!card) throw new NotFoundException('Card not found');

        const { mediaUrl, ...rest } = dto;
        return this.prisma.flashcard.update({
            where: { id: cardId },
            data: {
                ...rest,
                imageUrl: mediaUrl,
            },
        });
    }

    async deleteCard(userId: string, cardId: string) {
        const card = await this.prisma.flashcard.findFirst({
            where: { id: cardId, deck: { userId } },
        });
        if (!card) throw new NotFoundException('Card not found');

        await this.prisma.flashcard.delete({
            where: { id: cardId },
        });

        return { success: true };
    }

    async getStudyCards(userId: string, deckId: string) {
        const deck = await this.prisma.flashcardDeck.findFirst({
            where: { id: deckId, userId },
        });
        if (!deck) throw new NotFoundException('Deck not found');

        const now = new Date();
        return this.prisma.flashcard.findMany({
            where: {
                deckId,
                OR: [
                    { srsState: SrsState.NEW },
                    { srsState: SrsState.LEARNING },
                    {
                        srsState: SrsState.REVIEW,
                        nextReviewAt: { lte: now }
                    }
                ]
            },
            orderBy: { nextReviewAt: 'asc' },
        });
    }

    async reviewCard(userId: string, cardId: string, review: ReviewFlashcardDto) {
        const card = await this.prisma.flashcard.findFirst({
            where: { id: cardId, deck: { userId } },
            include: { deck: true },
        });
        if (!card) throw new NotFoundException('Card not found');

        const q = review.quality;
        let nextState = card.srsState;
        let interval = card.interval;
        let ease = Number(card.easeFactor);

        if (q === 0) {
            nextState = SrsState.LEARNING;
            interval = 0;
            ease = Math.max(1.3, ease - 0.2);
        } else {
            if (card.srsState === SrsState.NEW || card.srsState === SrsState.LEARNING) {
                nextState = SrsState.REVIEW;
                interval = 1;
            } else if (card.srsState === SrsState.REVIEW) {
                interval = Math.round(Math.max(1, interval) * ease);
                if (interval > 180) {
                    nextState = SrsState.MASTERED;
                }
            } else {
                interval = Math.round(interval * ease);
            }
        }

        const nextReviewAt = new Date();
        if (interval > 0) {
            nextReviewAt.setDate(nextReviewAt.getDate() + interval);
        }

        return this.prisma.flashcard.update({
            where: { id: cardId },
            data: {
                srsState: nextState,
                interval,
                easeFactor: ease,
                nextReviewAt,
            },
        });
    }

    async convertNoteToFlashcard(userId: string, noteId: string, deckId: string) {
        const note = await this.prisma.note.findFirst({
            where: { id: noteId, userId },
        });
        if (!note) throw new NotFoundException('Note not found');

        const deck = await this.prisma.flashcardDeck.findFirst({
            where: { id: deckId, userId },
        });
        if (!deck) throw new NotFoundException('Deck not found');

        return this.prisma.flashcard.create({
            data: {
                deckId,
                noteId,
                term: note.content.length > 50 ? note.content.substring(0, 50) + '...' : note.content,
                definition: note.content,
            },
        });
    }
}
