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
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import {
  CreateFlashcardDeckDto,
  CreateFlashcardDeckResponseDto,
  FlashcardDeckListResponseDto,
  FlashcardDeckQueryDto,
  DeleteFlashcardDeckResponseDto,
  UpdateFlashcardDeckDto,
  UpdateFlashcardDeckResponseDto,
} from '@workspace/dtos';

@Controller('api/me/flashcard-decks')
export class FlashcardDeckController {
  private readonly MOCK_USER_ID = '5e808603-1e54-4dc9-ae93-f1e347c101ab';

  constructor(
    @Inject('NATS_SERVICE')
    private readonly natsClient: ClientProxy,
  ) {}

  @Post()
  async create(
    @Body() input: CreateFlashcardDeckDto,
  ): Promise<CreateFlashcardDeckResponseDto> {
    const userId = this.MOCK_USER_ID;
    try {
      const response = await lastValueFrom<CreateFlashcardDeckResponseDto>(
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
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('jlptLevel') jlptLevel?: string,
  ): Promise<FlashcardDeckListResponseDto> {
    const userId = this.MOCK_USER_ID;
    const query: FlashcardDeckQueryDto = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      ...(search && { search }),
      ...(jlptLevel && { jlptLevel: jlptLevel as string }),
    };

    const response = await lastValueFrom<FlashcardDeckListResponseDto>(
      this.natsClient.send(
        { cmd: 'flashcard-deck.findAll' },
        { userId, query },
      ),
    );

    return response;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() input: UpdateFlashcardDeckDto,
  ): Promise<UpdateFlashcardDeckResponseDto> {
    const userId = this.MOCK_USER_ID;
    try {
      const response = await lastValueFrom<UpdateFlashcardDeckResponseDto>(
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
  ): Promise<DeleteFlashcardDeckResponseDto> {
    const userId = this.MOCK_USER_ID;
    try {
      const response = await lastValueFrom<DeleteFlashcardDeckResponseDto>(
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

