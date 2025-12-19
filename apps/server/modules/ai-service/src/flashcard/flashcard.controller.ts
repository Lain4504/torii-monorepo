import {Controller} from "@nestjs/common";
import {MessagePattern, Payload} from "@nestjs/microservices";
import {FlashcardService} from "./flashcard.service";
import {
    BulkFlashcardOperationsRequestDto,
    CreateFlashcardRequestDto,
    DeleteFlashcardRequestDto,
    FindAllFlashcardsRequestDto,
    GetFlashcardByIdRequestDto,
    UpdateFlashcardRequestDto
} from "@workspace/dtos";

@Controller()
export class FlashcardController {
    constructor(private readonly flashcardService: FlashcardService) {
    }

    @MessagePattern({cmd: 'flashcard.create'})
    createFlashcard(@Payload() data: CreateFlashcardRequestDto) {
        return this.flashcardService.createFlashcard(data);
    }

    @MessagePattern({cmd: 'flashcard.getAll'})
    getFlashcards(@Payload() data: FindAllFlashcardsRequestDto) {
        return this.flashcardService.getFlashcards(data);
    }

    @MessagePattern({cmd: 'flashcard.update'})
    updateFlashcard(@Payload() data: UpdateFlashcardRequestDto) {
        return this.flashcardService.updateFlashcard(data);
    }

    @MessagePattern({cmd: 'flashcard.delete'})
    deleteFlashcard(@Payload() data: DeleteFlashcardRequestDto) {
        return this.flashcardService.deleteFlashcard(data);
    }

    @MessagePattern({cmd: 'flashcard.getById'})
    getFlashcardById(@Payload() data: GetFlashcardByIdRequestDto) {
        return this.flashcardService.getFlashcardById(data);
    }

    @MessagePattern({cmd: 'flashcard.bulkOperations'})
    bulkOperations(@Payload() data: BulkFlashcardOperationsRequestDto) {
        return this.flashcardService.bulkOperations(data);
    }
}