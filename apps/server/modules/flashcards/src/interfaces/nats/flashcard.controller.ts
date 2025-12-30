import { Controller, Logger, OnModuleInit } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { FlashcardService } from '../../modules/flashcard/flashcard.service';
import type {
    FlashcardCreateDTO,
    FlashcardUpdateDTO,
    FlashcardQueryDTO,
    FlashcardResponseDTO,
    FlashcardPaginatedResponse,
    BulkFlashcardOperationsDTO,
    BulkFlashcardOperationsResponseDTO,
} from "@workspace/schemas";

@Controller()
export class FlashcardController implements OnModuleInit {
    private readonly logger = new Logger(FlashcardController.name);

    constructor(private readonly flashcardService: FlashcardService) {
    }

    onModuleInit() {
        this.logger.log('FlashcardController initialized and listening for events');
    }

    @MessagePattern({ cmd: 'flashcard.create' })
    async createFlashcard(@Payload() data: { userId: string; input: FlashcardCreateDTO }): Promise<FlashcardResponseDTO> {
        this.logger.log(`Received flashcard.create request for user ${data.userId}`);
        return this.flashcardService.createFlashcard(data.userId, data.input);
    }

    @MessagePattern({ cmd: 'flashcard.getAll' })
    async getFlashcards(@Payload() data: FlashcardQueryDTO): Promise<FlashcardPaginatedResponse> {
        return this.flashcardService.getFlashcards(data);
    }

    @MessagePattern({ cmd: 'flashcard.update' })
    async updateFlashcard(@Payload() data: { userId: string; input: FlashcardUpdateDTO }): Promise<FlashcardResponseDTO> {
        this.logger.log(`Received flashcard.update request for user ${data.userId}`);
        return this.flashcardService.updateFlashcard(data.userId, data.input);
    }

    @MessagePattern({ cmd: 'flashcard.delete' })
    async deleteFlashcard(@Payload() data: { id: string }): Promise<{ success: boolean }> {
        return this.flashcardService.deleteFlashcard(data);
    }

    @MessagePattern({ cmd: 'flashcard.getById' })
    async getFlashcardById(@Payload() data: { id: string }): Promise<FlashcardResponseDTO> {
        return this.flashcardService.getFlashcardById(data);
    }

    @MessagePattern({ cmd: 'flashcard.bulkOperations' })
    async bulkOperations(@Payload() data: BulkFlashcardOperationsDTO): Promise<BulkFlashcardOperationsResponseDTO> {
        return this.flashcardService.bulkOperations(data);
    }
}