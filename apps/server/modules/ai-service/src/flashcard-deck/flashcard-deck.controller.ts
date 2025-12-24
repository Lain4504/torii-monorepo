import { Controller, Logger, OnModuleInit } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FlashcardDeckService } from './flashcard-deck.service';
import {
  CreateFlashcardDeckDto,
  CreateFlashcardDeckResponseDto,
  FlashcardDeckListResponseDto,
  FlashcardDeckQueryDto,
  DeleteFlashcardDeckRequestDto,
  DeleteFlashcardDeckResponseDto,
  UpdateFlashcardDeckDto,
  UpdateFlashcardDeckResponseDto,
} from '@workspace/dtos';

@Controller()
export class FlashcardDeckController implements OnModuleInit {
  private readonly logger = new Logger(FlashcardDeckController.name);

  constructor(private readonly flashcardDeckService: FlashcardDeckService) {}

  onModuleInit() {
    this.logger.log('FlashcardDeckController initialized and listening for events');
  }

  @MessagePattern({ cmd: 'flashcard-deck.create' })
  async createDeck(
    @Payload() data: { userId: string; input: CreateFlashcardDeckDto },
  ): Promise<CreateFlashcardDeckResponseDto> {
    this.logger.log(`Received flashcard-deck.create request for user ${data.userId}`);
    return this.flashcardDeckService.createDeck(data.userId, data.input);
  }

  @MessagePattern({ cmd: 'flashcard-deck.findAll' })
  async findAllDecks(
    @Payload() data: { userId: string; query: FlashcardDeckQueryDto },
  ): Promise<FlashcardDeckListResponseDto> {
    this.logger.log(`Received flashcard-deck.findAll request for user ${data.userId}`);
    return this.flashcardDeckService.findAllDecks(data.userId, data.query);
  }

  @MessagePattern({ cmd: 'flashcard-deck.update' })
  async updateDeck(
    @Payload() data: { userId: string; deckId: string; input: UpdateFlashcardDeckDto },
  ): Promise<UpdateFlashcardDeckResponseDto> {
    this.logger.log(`Received flashcard-deck.update request for deck ${data.deckId} by user ${data.userId}`);
    return this.flashcardDeckService.updateDeck(data.userId, data.deckId, data.input);
  }

  @MessagePattern({ cmd: 'flashcard-deck.delete' })
  async deleteDeck(
    @Payload() data: { userId: string; input: DeleteFlashcardDeckRequestDto },
  ): Promise<DeleteFlashcardDeckResponseDto> {
    this.logger.log(`Received flashcard-deck.delete request for user ${data.userId}`);
    return this.flashcardDeckService.deleteDeck(data.userId, data.input);
  }
}



