import { Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query, UsePipes } from '@nestjs/common';
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { ZodValidationPipe } from '@server/shared/pipes/zod-validation.pipe';
import {
    flashcardCreateDTOSchema,
    flashcardUpdateDTOSchema,
    flashcardQueryDTOSchema,
    bulkFlashcardOperationsDTOSchema,
} from "@workspace/schemas";
import type {
    FlashcardCreateDTO,
    FlashcardUpdateDTO,
    FlashcardQueryDTO,
    FlashcardResponseDTO,
    FlashcardPaginatedResponse,
    BulkFlashcardOperationsDTO,
    BulkFlashcardOperationsResponseDTO,
} from "@workspace/schemas";

@Controller('api/me/flashcards')
export class FlashcardController {
    private readonly MOCK_USER_ID = '5e808603-1e54-4dc9-ae93-f1e347c101ab';

    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) {
    }

    @Post()
    @UsePipes(new ZodValidationPipe(flashcardCreateDTOSchema))
    async createFlashcard(
        @Body() data: FlashcardCreateDTO,
    ): Promise<FlashcardResponseDTO> {
        const userId = this.MOCK_USER_ID;
        return await firstValueFrom<FlashcardResponseDTO>(
            this.natsClient.send({ cmd: 'flashcard.create' }, { userId, input: data })
        );
    }

    @Get()
    @UsePipes(new ZodValidationPipe(flashcardQueryDTOSchema.partial()))
    async getFlashcards(
        @Query() query: FlashcardQueryDTO,
    ): Promise<FlashcardPaginatedResponse> {
        return await firstValueFrom<FlashcardPaginatedResponse>(
            this.natsClient.send({ cmd: 'flashcard.getAll' }, query)
        );
    }

    @Get(':id')
    async getFlashcardById(@Param('id') id: string): Promise<FlashcardResponseDTO> {
        return await firstValueFrom<FlashcardResponseDTO>(
            this.natsClient.send({ cmd: 'flashcard.getById' }, { id })
        );
    }

    @Patch(':id')
    @UsePipes(new ZodValidationPipe(flashcardUpdateDTOSchema.partial()))
    async updateFlashcard(
        @Param('id') id: string,
        @Body() data: Omit<FlashcardUpdateDTO, 'id'>
    ): Promise<FlashcardResponseDTO> {
        const userId = this.MOCK_USER_ID;
        const payload: FlashcardUpdateDTO = { ...data, id } as FlashcardUpdateDTO;
        return await firstValueFrom<FlashcardResponseDTO>(
            this.natsClient.send({ cmd: 'flashcard.update' }, { userId, input: payload })
        );
    }

    @Delete(':id')
    async deleteFlashcard(@Param('id') id: string): Promise<void> {
        return await firstValueFrom<void>(
            this.natsClient.send({ cmd: 'flashcard.delete' }, { id })
        );
    }

    @Post('bulk')
    @UsePipes(new ZodValidationPipe(bulkFlashcardOperationsDTOSchema))
    async bulkOperations(@Body() data: BulkFlashcardOperationsDTO): Promise<BulkFlashcardOperationsResponseDTO> {
        return await firstValueFrom<BulkFlashcardOperationsResponseDTO>(
            this.natsClient.send({ cmd: 'flashcard.bulkOperations' }, data)
        );
    }
}

