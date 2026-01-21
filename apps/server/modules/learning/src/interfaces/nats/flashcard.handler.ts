import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
    FlashcardCreateDTO,
    FlashcardUpdateDTO,
    FlashcardQueryDTO,
    BulkFlashcardOperationsDTO
} from '@workspace/schemas';
import { IFlashcardService, FLASHCARD_SERVICE_TOKEN } from '../services/i-flashcard.service';

@Controller()
export class FlashcardHandler {
    constructor(
        @Inject(FLASHCARD_SERVICE_TOKEN)
        private readonly flashcardService: IFlashcardService
    ) { }

    @MessagePattern({ cmd: 'learning.flashcard.create' })
    async create(@Payload() data: FlashcardCreateDTO & { userId: string }) {
        return this.flashcardService.createFlashcard(data);
    }

    @MessagePattern({ cmd: 'learning.flashcard.findAll' })
    async findAll(@Payload() data: { query: FlashcardQueryDTO, userId: string }) {
        return this.flashcardService.getFlashcards({ ...data.query, userId: data.userId });
    }

    @MessagePattern({ cmd: 'learning.flashcard.findById' })
    async findById(@Payload() data: { id: string }) {
        return this.flashcardService.getFlashcardById(data.id);
    }

    @MessagePattern({ cmd: 'learning.flashcard.update' })
    async update(@Payload() data: FlashcardUpdateDTO & { userId: string }) {
        return this.flashcardService.updateFlashcard(data);
    }

    @MessagePattern({ cmd: 'learning.flashcard.delete' })
    async delete(@Payload() data: { id: string }) {
        await this.flashcardService.deleteFlashcard(data.id);
        return { success: true };
    }

    @MessagePattern({ cmd: 'learning.flashcard.bulk' })
    async bulkOperations(@Payload() data: BulkFlashcardOperationsDTO & { userId: string }) {
        return this.flashcardService.bulkOperations(data);
    }
}
