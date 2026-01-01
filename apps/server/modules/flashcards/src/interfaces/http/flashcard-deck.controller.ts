import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Logger, UseGuards, Req } from '@nestjs/common';
import { FlashcardDeckService } from '../../modules/flashcard-deck/flashcard-deck.service';
import type {
    FlashcardDeckCreateDTO,
    FlashcardDeckUpdateDTO,
    FlashcardDeckQueryDTO,
} from '@workspace/schemas';
import { GatewayAuthGuard } from '@server/shared';

@Controller('flashcard-decks')
@UseGuards(GatewayAuthGuard)
export class FlashcardDeckController {
    private readonly logger = new Logger(FlashcardDeckController.name);

    constructor(private readonly flashcardDeckService: FlashcardDeckService) { }

    @Post()
    async createDeck(
        @Req() req: any,
        @Body() input: FlashcardDeckCreateDTO,
    ) {
        const userId = req.user.uid;
        this.logger.log(`Received flashcard-deck.create request for user ${userId}`);
        return this.flashcardDeckService.createDeck(userId, input);
    }

    @Get()
    async findAllDecks(
        @Req() req: any,
        @Query() query: FlashcardDeckQueryDTO,
    ) {
        const userId = req.user.uid;
        this.logger.log(`Received flashcard-deck.findAll request for user ${userId}`);
        return this.flashcardDeckService.findAllDecks(userId, query);
    }

    @Patch(':id')
    async updateDeck(
        @Req() req: any,
        @Param('id') deckId: string,
        @Body() input: FlashcardDeckUpdateDTO,
    ) {
        const userId = req.user.uid;
        this.logger.log(`Received flashcard-deck.update request for deck ${deckId} by user ${userId}`);
        return this.flashcardDeckService.updateDeck(userId, deckId, input);
    }

    @Delete(':id')
    async deleteDeck(
        @Req() req: any,
        @Param('id') id: string,
    ) {
        const userId = req.user.uid;
        this.logger.log(`Received flashcard-deck.delete request for user ${userId}`);
        return this.flashcardDeckService.deleteDeck(userId, { id });
    }
}
