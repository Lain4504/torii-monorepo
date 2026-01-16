import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FlashcardDeckService } from '../../modules/flashcard-deck/flashcard-deck.service';
import { FlashcardDeckCreateDTO, FlashcardDeckUpdateDTO, FlashcardDeckQueryDTO } from '@workspace/schemas';

@Controller()
export class FlashcardDeckHandler {
    constructor(private readonly flashcardDeckService: FlashcardDeckService) { }

    @MessagePattern({ cmd: 'learning.flashcard-deck.create' })
    async create(@Payload() data: FlashcardDeckCreateDTO & { userId: string }) {
        const { userId, ...input } = data;
        return this.flashcardDeckService.createDeck(userId, input);
    }

    @MessagePattern({ cmd: 'learning.flashcard-deck.findAll' })
    async findAll(@Payload() data: { query: FlashcardDeckQueryDTO, userId: string }) {
        return this.flashcardDeckService.findAllDecks(data.userId, data.query);
    }

    @MessagePattern({ cmd: 'learning.flashcard-deck.update' })
    async update(@Payload() data: { id: string, input: FlashcardDeckUpdateDTO, userId: string }) {
        return this.flashcardDeckService.updateDeck(data.userId, data.id, data.input);
    }

    @MessagePattern({ cmd: 'learning.flashcard-deck.delete' })
    async delete(@Payload() data: { id: string, userId: string }) {
        return this.flashcardDeckService.deleteDeck(data.userId, { id: data.id });
    }
}
