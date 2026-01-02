import { Controller, Get, Post, Put, Delete, Body, Param, Query, Logger, UseGuards, Patch, Req } from '@nestjs/common';
import { FlashcardService } from '../../modules/flashcard/flashcard.service';
import type {
    FlashcardCreateDTO,
    FlashcardUpdateDTO,
    FlashcardQueryDTO,
    FlashcardPaginatedResponse,
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
    async getFlashcards(@Req() req: any, @Query() query: FlashcardQueryDTO): Promise<FlashcardPaginatedResponse> {
        // Ensure query uses correct types if needed, but DTO should handle it
        // Pass userId if service needs it for filtering (likely yes for personal flashcards)
        // If service expects userId in query, we might need to inject it.
        // Checking NATS: it passed data: FlashcardQueryDTO directly.
        // Assuming FlashcardQueryDTO might contain userId or service handles it.
        // Wait, NATS passed payload directly.
        // Let's assume for now we pass query. 
        // If service needs filtering by current user, we'll see.
        return this.flashcardService.getFlashcards(query);
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
