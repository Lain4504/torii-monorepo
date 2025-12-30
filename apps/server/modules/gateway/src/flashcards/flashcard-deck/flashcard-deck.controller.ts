import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  HttpStatus,
  UsePipes,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { ZodValidationPipe } from '@server/shared/pipes/zod-validation.pipe';
import {
  flashcardDeckCreateDTOSchema,
  flashcardDeckUpdateDTOSchema,
  flashcardDeckQueryDTOSchema,
} from '@workspace/schemas';
import type {
  FlashcardDeckCreateDTO,
  FlashcardDeckUpdateDTO,
  FlashcardDeckResponseDTO,
  FlashcardDeckQueryDTO,
  FlashcardDeckPaginatedResponse,
} from '@workspace/schemas';

@Controller('api/me/flashcard-decks')
export class FlashcardDeckController {
  private readonly MOCK_USER_ID = '5e808603-1e54-4dc9-ae93-f1e347c101ab';

  constructor(
    @Inject('NATS_SERVICE')
    private readonly natsClient: ClientProxy,
  ) { }

  @Post()
  @UsePipes(new ZodValidationPipe(flashcardDeckCreateDTOSchema))
  async create(
    @Body() input: FlashcardDeckCreateDTO,
  ): Promise<FlashcardDeckResponseDTO> {
    const userId = this.MOCK_USER_ID;
    try {
      const response = await lastValueFrom<FlashcardDeckResponseDTO>(
        this.natsClient.send(
          { cmd: 'flashcard-deck.create' },
          { userId, input },
        ),
      );
      return response;
    } catch (error: any) {
      console.error('Gateway: Error in flashcard-deck.create:', error);
      throw error;
    }
  }

  @Get()
  @UsePipes(new ZodValidationPipe(flashcardDeckQueryDTOSchema.partial()))
  async findAll(
    @Query() query: FlashcardDeckQueryDTO,
  ): Promise<FlashcardDeckPaginatedResponse> {
    const userId = this.MOCK_USER_ID;
    const response = await lastValueFrom<FlashcardDeckPaginatedResponse>(
      this.natsClient.send(
        { cmd: 'flashcard-deck.findAll' },
        { userId, query },
      ),
    );

    return response;
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(flashcardDeckUpdateDTOSchema.partial()))
  async update(
    @Param('id') id: string,
    @Body() input: FlashcardDeckUpdateDTO,
  ): Promise<FlashcardDeckResponseDTO> {
    const userId = this.MOCK_USER_ID;
    try {
      const response = await lastValueFrom<FlashcardDeckResponseDTO>(
        this.natsClient.send(
          { cmd: 'flashcard-deck.update' },
          { userId, deckId: id, input },
        ),
      );
      return response;
    } catch (error: any) {
      console.error('Gateway: Error in flashcard-deck.update:', error);
      throw error;
    }
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    const userId = this.MOCK_USER_ID;
    try {
      const response = await lastValueFrom<{ success: boolean }>(
        this.natsClient.send(
          { cmd: 'flashcard-deck.delete' },
          { userId, input: { id } },
        ),
      );
      return response;
    } catch (error: any) {
      console.error('Gateway: Error deleting flashcard deck:', error);
      throw error;
    }
  }
}

