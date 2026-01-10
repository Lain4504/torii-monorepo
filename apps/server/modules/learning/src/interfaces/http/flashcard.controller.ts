import { Controller, Get, Post, Put, Delete, Body, Param, Query, Logger, UseGuards, Patch, Req } from '@nestjs/common';
import { FlashcardService } from '../../modules/flashcard/flashcard.service';
import type {
    FlashcardCreateDTO,
    FlashcardUpdateDTO,
    FlashcardQueryDTO,
    PaginatedResponseDTO,
    FlashcardResponseDTO,
    BulkFlashcardOperationsDTO,
} from "@workspace/schemas";
import { GatewayAuthGuard } from '@server/shared';
import type { Request } from 'express';

@Controller('flashcards')
@UseGuards(GatewayAuthGuard)
export class FlashcardController {
    private readonly logger = new Logger(FlashcardController.name);

    constructor(private readonly flashcardService: FlashcardService) { }

    @Post()
    async createFlashcard(@Req() req: any, @Body() input: FlashcardCreateDTO) {
        const userId = req.user.uid;
        this.logger.log(`Received flashcard.create request for user ${userId}`);
        return this.flashcardService.createFlashcard(userId, input);
    }

    @Get()
    async getFlashcards(@Req() req: any, @Query() query: FlashcardQueryDTO): Promise<PaginatedResponseDTO<FlashcardResponseDTO>> {
        const userId = req.user.uid;
        this.logger.log(`Getting flashcards for user ${userId}`);
        // Pass userId to ensure only personal flashcards (from user's decks) are returned
        return this.flashcardService.getFlashcards(userId, query);
    }

    @Get(':id')
    async getFlashcardById(@Param('id') id: string) {
        return this.flashcardService.getFlashcardById({ id });
    }

    @Patch()
    async updateFlashcard(@Req() req: any, @Body() input: FlashcardUpdateDTO) {
        const userId = req.user.uid;
        this.logger.log(`Received flashcard.update request for user ${userId}`);
        return this.flashcardService.updateFlashcard(userId, input);
    }

    @Delete(':id')
    async deleteFlashcard(@Param('id') id: string) {
        return this.flashcardService.deleteFlashcard({ id });
    }

    @Post('bulk')
    async bulkOperations(@Body() data: BulkFlashcardOperationsDTO) {
        return this.flashcardService.bulkOperations(data);
    }
}
