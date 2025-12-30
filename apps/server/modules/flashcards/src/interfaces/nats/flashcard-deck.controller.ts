import { Controller, Logger, OnModuleInit } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FlashcardDeckService } from '../../modules/flashcard-deck/flashcard-deck.service';
import type {
  FlashcardDeckCreateDTO,
  FlashcardDeckUpdateDTO,
  FlashcardDeckQueryDTO,
  FlashcardDeckResponseDTO,
  FlashcardDeckPaginatedResponse,
} from '@workspace/schemas';

@Controller()
export class FlashcardDeckController implements OnModuleInit {
  private readonly logger = new Logger(FlashcardDeckController.name);

  constructor(private readonly flashcardDeckService: FlashcardDeckService) { }

  onModuleInit() {
    this.logger.log('FlashcardDeckController initialized and listening for events');
  }

  @MessagePattern({ cmd: 'flashcard-deck.create' })
  async createDeck(
    @Payload() data: { userId: string; input: FlashcardDeckCreateDTO },
  ): Promise<FlashcardDeckResponseDTO> {
    this.logger.log(`Received flashcard-deck.create request for user ${data.userId}`);
    return this.flashcardDeckService.createDeck(data.userId, data.input);
  }

  @MessagePattern({ cmd: 'flashcard-deck.findAll' })
  async findAllDecks(
    @Payload() data: { userId: string; query: FlashcardDeckQueryDTO },
  ): Promise<FlashcardDeckPaginatedResponse> {
    this.logger.log(`Received flashcard-deck.findAll request for user ${data.userId}`);
    return this.flashcardDeckService.findAllDecks(data.userId, data.query);
  }

  @MessagePattern({ cmd: 'flashcard-deck.update' })
  async updateDeck(
    @Payload() data: { userId: string; deckId: string; input: FlashcardDeckUpdateDTO },
  ): Promise<FlashcardDeckResponseDTO> {
    this.logger.log(`Received flashcard-deck.update request for deck ${data.deckId} by user ${data.userId}`);
    return this.flashcardDeckService.updateDeck(data.userId, data.deckId, data.input);
  }

  @MessagePattern({ cmd: 'flashcard-deck.delete' })
  async deleteDeck(
    @Payload() data: { userId: string; input: { id: string } },
  ): Promise<{ success: boolean }> {
    this.logger.log(`Received flashcard-deck.delete request for user ${data.userId}`);
    return this.flashcardDeckService.deleteDeck(data.userId, data.input);
  }
}



