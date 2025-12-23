import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { ClientProxy } from "@nestjs/microservices";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
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

@ApiTags('flashcards')
@Controller('api/me/flashcards')
@ApiBearerAuth()
export class FlashcardController {
    private readonly MOCK_USER_ID = '5e808603-1e54-4dc9-ae93-f1e347c101ab';

    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) {
    }

    @Post()
    @ApiOperation({ summary: 'Create a new flashcard' })
    @ApiResponse({ status: 201, description: 'Flashcard created successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not owner of deck' })
    async createFlashcard(
        @Body() data: CreateFlashcardRequestDto,
    ) {
        const userId = this.MOCK_USER_ID;
        return await firstValueFrom<CreateFlashcardResponseDto>(
            this.natsClient.send({ cmd: 'flashcard.create' }, { userId, input: data })
        );
    }

    @Get()
    @ApiOperation({ summary: 'Get all flashcards with pagination and filters' })
    @ApiResponse({ status: 200, description: 'Return flashcard list' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'deckId', required: false, type: String })
    @ApiQuery({ name: 'search', required: false, type: String })
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
    @ApiOperation({ summary: 'Get flashcard by ID' })
    @ApiResponse({ status: 200, description: 'Return flashcard details' })
    async getFlashcardById(@Param('id') id: string) {
        const payload: GetFlashcardByIdRequestDto = { id };
        return await firstValueFrom<GetFlashcardByIdResponseDto>(
            this.natsClient.send({ cmd: 'flashcard.getById' }, payload)
        );
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a flashcard' })
    @ApiResponse({ status: 200, description: 'Flashcard updated successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not owner of deck' })
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
    @ApiOperation({ summary: 'Delete a flashcard' })
    @ApiResponse({ status: 200, description: 'Flashcard deleted successfully' })
    async deleteFlashcard(@Param('id') id: string) {
        const payload: DeleteFlashcardRequestDto = { id };
        return await firstValueFrom<DeleteFlashcardResponseDto>(
            this.natsClient.send({ cmd: 'flashcard.delete' }, payload)
        );
    }

    @Post('bulk')
    @ApiOperation({ summary: 'Perform bulk operations (create, update, delete)' })
    @ApiResponse({ status: 200, description: 'Bulk operations completed' })
    async bulkOperations(@Body() data: BulkFlashcardOperationsRequestDto) {
        return await firstValueFrom<BulkFlashcardOperationsResponseDto>(
            this.natsClient.send({ cmd: 'flashcard.bulkOperations' }, data)
        );
    }
}

