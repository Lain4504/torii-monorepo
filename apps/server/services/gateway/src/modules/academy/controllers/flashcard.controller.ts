import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    UseGuards,
    Req,
    Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    successResponse,
    errorResponse,
    GatewayAuthGuard,
    ReqWithRequester,
} from '@server/shared';

@Controller('api/flashcards')
@UseGuards(GatewayAuthGuard)
export class FlashcardController {
    constructor(
        @Inject('NATS_SERVICE') private readonly natsClient: ClientProxy,
    ) { }

    @Post('decks')
    async createDeck(@Body() dto: any, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'academy.flashcard.createDeck' },
                    { userId: req.requester.sub, dto },
                ),
            );
            return successResponse(result, 'Deck created successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to create deck');
        }
    }

    @Get('decks')
    async getMyDecks(@Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'academy.flashcard.getMyDecks' },
                    { userId: req.requester.sub },
                ),
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch decks');
        }
    }

    @Get('decks/:id')
    async getDeckById(@Param('id') id: string, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'academy.flashcard.getDeckById' },
                    { userId: req.requester.sub, deckId: id },
                ),
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch deck');
        }
    }

    @Patch('decks/:id')
    async updateDeck(@Param('id') id: string, @Body() dto: any, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'academy.flashcard.updateDeck' },
                    { userId: req.requester.sub, deckId: id, dto },
                ),
            );
            return successResponse(result, 'Deck updated successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to update deck');
        }
    }

    @Delete('decks/:id')
    async deleteDeck(@Param('id') id: string, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'academy.flashcard.deleteDeck' },
                    { userId: req.requester.sub, deckId: id },
                ),
            );
            return successResponse(result, 'Deck deleted successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete deck');
        }
    }

    @Post('decks/:id/cards')
    async addCard(@Param('id') id: string, @Body() dto: any, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'academy.flashcard.addCard' },
                    { userId: req.requester.sub, deckId: id, dto },
                ),
            );
            return successResponse(result, 'Card added successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to add card');
        }
    }

    @Get('decks/:id/cards')
    async getDeckCards(@Param('id') id: string, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'academy.flashcard.getDeckCards' },
                    { userId: req.requester.sub, deckId: id },
                ),
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch cards');
        }
    }

    @Patch('cards/:id')
    async updateCard(@Param('id') id: string, @Body() dto: any, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'academy.flashcard.updateCard' },
                    { userId: req.requester.sub, cardId: id, dto },
                ),
            );
            return successResponse(result, 'Card updated successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to update card');
        }
    }

    @Delete('cards/:id')
    async deleteCard(@Param('id') id: string, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'academy.flashcard.deleteCard' },
                    { userId: req.requester.sub, cardId: id },
                ),
            );
            return successResponse(result, 'Card deleted successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete card');
        }
    }

    @Get('decks/:id/study')
    async getStudyCards(@Param('id') id: string, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'academy.flashcard.getStudyCards' },
                    { userId: req.requester.sub, deckId: id },
                ),
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch study cards');
        }
    }

    @Post('cards/:id/review')
    async reviewCard(@Param('id') id: string, @Body() review: any, @Req() req: ReqWithRequester) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'academy.flashcard.reviewCard' },
                    { userId: req.requester.sub, cardId: id, review },
                ),
            );
            return successResponse(result, 'Card reviewed successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to review card');
        }
    }
}
