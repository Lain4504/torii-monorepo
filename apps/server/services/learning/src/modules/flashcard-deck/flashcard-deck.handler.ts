import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  FlashcardDeckCreateDTO,
  FlashcardDeckUpdateDTO,
  FlashcardDeckQueryDTO,
} from '@workspace/schemas';
import {
  IFlashcardDeckService,
  FLASHCARD_DECK_SERVICE_TOKEN,
} from '@server/learning/interfaces/services/i-flashcard-deck.service';

@Controller()
export class FlashcardDeckHandler {
  constructor(
    @Inject(FLASHCARD_DECK_SERVICE_TOKEN)
    private readonly flashcardDeckService: IFlashcardDeckService,
  ) {}

  @MessagePattern({ cmd: 'learning.flashcard-deck.create' })
  async create(@Payload() data: FlashcardDeckCreateDTO & { userId: string }) {
    return this.flashcardDeckService.createDeck(data);
  }

  @MessagePattern({ cmd: 'learning.flashcard-deck.findAll' })
  async findAll(
    @Payload() data: { query: FlashcardDeckQueryDTO; userId: string },
  ) {
    return this.flashcardDeckService.findAllDecks({
      ...data.query,
      userId: data.userId,
    });
  }

  @MessagePattern({ cmd: 'learning.flashcard-deck.findById' })
  async findById(@Payload() data: { id: string; userId: string }) {
    return this.flashcardDeckService.findOneDeck(data.id, data.userId);
  }

  @MessagePattern({ cmd: 'learning.flashcard-deck.update' })
  async update(
    @Payload()
    data: {
      id: string;
      input: FlashcardDeckUpdateDTO;
      userId: string;
    },
  ) {
    return this.flashcardDeckService.updateDeck(
      data.id,
      data.input,
      data.userId,
    );
  }

  @MessagePattern({ cmd: 'learning.flashcard-deck.delete' })
  async delete(@Payload() data: { id: string; userId: string }) {
    await this.flashcardDeckService.deleteDeck(data.id, data.userId);
    return { success: true };
  }
}
