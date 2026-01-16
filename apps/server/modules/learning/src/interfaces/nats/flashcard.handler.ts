import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FlashcardService } from '../../modules/flashcard/flashcard.service';
import {
    FlashcardCreateDTO,
    FlashcardUpdateDTO,
    FlashcardQueryDTO,
    BulkFlashcardOperationsDTO
} from '@workspace/schemas';

@Controller()
export class FlashcardHandler {
    constructor(private readonly flashcardService: FlashcardService) { }

    @MessagePattern({ cmd: 'learning.flashcard.create' })
    async create(@Payload() data: FlashcardCreateDTO & { userId: string }) {
        const { userId, ...input } = data;
        return this.flashcardService.createFlashcard(userId, input);
    }

    @MessagePattern({ cmd: 'learning.flashcard.findAll' })
    async findAll(@Payload() data: { query: FlashcardQueryDTO, userId: string }) {
        return this.flashcardService.getFlashcards(data.userId, data.query);
    }

    @MessagePattern({ cmd: 'learning.flashcard.findById' })
    async findById(@Payload() data: { id: string }) {
        return this.flashcardService.getFlashcardById({ id: data.id });
    }

    @MessagePattern({ cmd: 'learning.flashcard.update' })
    async update(@Payload() data: FlashcardUpdateDTO & { userId: string }) {
        const { userId, ...input } = data;
        return this.flashcardService.updateFlashcard(userId, input);
    }

    @MessagePattern({ cmd: 'learning.flashcard.delete' })
    async delete(@Payload() data: { id: string }) {
        return this.flashcardService.deleteFlashcard({ id: data.id });
    }

    @MessagePattern({ cmd: 'learning.flashcard.bulk' })
    async bulkOperations(@Payload() data: BulkFlashcardOperationsDTO) {
        return this.flashcardService.bulkOperations(data);
    }
}
