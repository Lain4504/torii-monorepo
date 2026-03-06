import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FlashcardService } from './flashcard.service';
import { CreateDeckDto, CreateFlashcardDto, ReviewFlashcardDto } from './flashcard.dto';

@Controller()
export class FlashcardHandler {
    constructor(private readonly flashcardService: FlashcardService) { }

    @MessagePattern({ cmd: 'academy.flashcard.createDeck' })
    async createDeck(@Payload() data: { userId: string; dto: CreateDeckDto }) {
        return this.flashcardService.createDeck(data.userId, data.dto);
    }

    @MessagePattern({ cmd: 'academy.flashcard.getMyDecks' })
    async getMyDecks(@Payload() data: { userId: string }) {
        return this.flashcardService.getMyDecks(data.userId);
    }

    @MessagePattern({ cmd: 'academy.flashcard.getDeckById' })
    async getDeckById(@Payload() data: { userId: string; deckId: string }) {
        return this.flashcardService.getDeckById(data.userId, data.deckId);
    }

    @MessagePattern({ cmd: 'academy.flashcard.addCard' })
    async addCard(@Payload() data: { userId: string; deckId: string; dto: CreateFlashcardDto }) {
        return this.flashcardService.addCard(data.userId, data.deckId, data.dto);
    }

    @MessagePattern({ cmd: 'academy.flashcard.getStudyCards' })
    async getStudyCards(@Payload() data: { userId: string; deckId: string }) {
        return this.flashcardService.getStudyCards(data.userId, data.deckId);
    }

    @MessagePattern({ cmd: 'academy.flashcard.reviewCard' })
    async reviewCard(@Payload() data: { userId: string; cardId: string; review: ReviewFlashcardDto }) {
        return this.flashcardService.reviewCard(data.userId, data.cardId, data.review);
    }
}
