import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import {
    BulkFlashcardOperationsRequestDto,
    BulkFlashcardOperationsResponseDto,
    CreateFlashcardRequestDto,
    CreateFlashcardResponseDto,
    DeleteFlashcardRequestDto,
    DeleteFlashcardResponseDto,
    DifficultyLevel,
    FindAllFlashcardsRequestDto,
    FlashcardViewListResponseDto,
    GetFlashcardByIdRequestDto,
    GetFlashcardByIdResponseDto,
    UpdateFlashcardRequestDto,
    UpdateFlashcardResponseDto
} from "@workspace/dtos";

@Controller('api/me/flashcards')
export class FlashcardController {
    private readonly MOCK_USER_ID = '5e808603-1e54-4dc9-ae93-f1e347c101ab';

    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) {
    }

    @Post()
    async createFlashcard(
        @Body() data: CreateFlashcardRequestDto,
    ) {
        const userId = this.MOCK_USER_ID;
        return await firstValueFrom<CreateFlashcardResponseDto>(
            this.natsClient.send({ cmd: 'flashcard.create' }, { userId, input: data })
        );
    }

    @Get()
    async getFlashcards(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('deckId') deckId?: string,
        @Query('search') search?: string,
    ) {
        const payload: FindAllFlashcardsRequestDto = {
            page: Number(page),
            limit: Number(limit),
            deckId: deckId,
            search: search,
            // Default values for required fields
            difficulty: DifficultyLevel.DIFFICULTY_UNSPECIFIED,
            tags: [],
            jlptLevel: undefined,
            dueForReview: false,
            userId: undefined
        };

        return await firstValueFrom<FlashcardViewListResponseDto>(
            this.natsClient.send({ cmd: 'flashcard.getAll' }, payload)
        );
    }

    @Get(':id')
    async getFlashcardById(@Param('id') id: string) {
        const payload: GetFlashcardByIdRequestDto = { id };
        return await firstValueFrom<GetFlashcardByIdResponseDto>(
            this.natsClient.send({ cmd: 'flashcard.getById' }, payload)
        );
    }

    @Patch(':id')
    async updateFlashcard(
        @Param('id') id: string,
        @Body() data: Omit<UpdateFlashcardRequestDto, 'id'>
    ) {
        const userId = this.MOCK_USER_ID;
        const payload: UpdateFlashcardRequestDto = { ...data, id };
        return await firstValueFrom<UpdateFlashcardResponseDto>(
            this.natsClient.send({ cmd: 'flashcard.update' }, { userId, input: payload })
        );
    }

    @Delete(':id')
    async deleteFlashcard(@Param('id') id: string) {
        const payload: DeleteFlashcardRequestDto = { id };
        return await firstValueFrom<DeleteFlashcardResponseDto>(
            this.natsClient.send({ cmd: 'flashcard.delete' }, payload)
        );
    }

    @Post('bulk')
    async bulkOperations(@Body() data: BulkFlashcardOperationsRequestDto) {
        return await firstValueFrom<BulkFlashcardOperationsResponseDto>(
            this.natsClient.send({ cmd: 'flashcard.bulkOperations' }, data)
        );
    }
}

