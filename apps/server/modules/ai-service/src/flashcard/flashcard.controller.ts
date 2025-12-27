import { Controller, Logger, OnModuleInit } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { FlashcardService } from "./flashcard.service";
import {
    BulkFlashcardOperationsRequestDto,
    CreateFlashcardRequestDto,
    DeleteFlashcardRequestDto,
    FindAllFlashcardsRequestDto,
    GetFlashcardByIdRequestDto,
    UpdateFlashcardRequestDto
} from "@workspace/dtos";

@Controller()
export class FlashcardController implements OnModuleInit {
    private readonly logger = new Logger(FlashcardController.name);

    constructor(private readonly flashcardService: FlashcardService) {
    }

    onModuleInit() {
        this.logger.log('FlashcardController initialized and listening for events');
    }

    @MessagePattern({ cmd: 'flashcard.create' })
    createFlashcard(@Payload() data: { userId: string; input: CreateFlashcardRequestDto }) {
        this.logger.log(`Received flashcard.create request for user ${data.userId}`);
        return this.flashcardService.createFlashcard(data.userId, data.input);
    }

    @MessagePattern({ cmd: 'flashcard.getAll' })
    getFlashcards(@Payload() data: FindAllFlashcardsRequestDto) {
        return this.flashcardService.getFlashcards(data);
    }

    @MessagePattern({ cmd: 'flashcard.update' })
    updateFlashcard(@Payload() data: { userId: string; input: UpdateFlashcardRequestDto }) {
        this.logger.log(`Received flashcard.update request for user ${data.userId}`);
        return this.flashcardService.updateFlashcard(data.userId, data.input);
    }

    @MessagePattern({ cmd: 'flashcard.delete' })
    deleteFlashcard(@Payload() data: DeleteFlashcardRequestDto) {
        return this.flashcardService.deleteFlashcard(data);
    }

    @MessagePattern({ cmd: 'flashcard.getById' })
    getFlashcardById(@Payload() data: GetFlashcardByIdRequestDto) {
        return this.flashcardService.getFlashcardById(data);
    }

    @MessagePattern({ cmd: 'flashcard.bulkOperations' })
    bulkOperations(@Payload() data: BulkFlashcardOperationsRequestDto) {
        return this.flashcardService.bulkOperations(data);
    }
}