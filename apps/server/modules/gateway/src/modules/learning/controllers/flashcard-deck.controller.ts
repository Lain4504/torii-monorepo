import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Req,
    Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    successResponse,
    errorResponse,
    successPaginatedResponse
} from '@server/shared';
import { GatewayAuthGuard } from '@server/shared';
import { Request } from 'express';

@Controller('api/flashcard-decks')
@UseGuards(GatewayAuthGuard)
export class FlashcardDeckController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post()
    async createDeck(@Body() input: any, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.flashcard-deck.create' },
                    { ...input, userId: user.sub }
                )
            );
            return successResponse({ deck: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to create flashcard deck');
        }
    }

    @Get()
    async findAllDecks(@Query() query: any, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.flashcard-deck.findAll' },
                    { query, userId: user.sub }
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch flashcard decks');
        }
    }

    @Patch(':id')
    async updateDeck(@Param('id') id: string, @Body() input: any, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.flashcard-deck.update' },
                    { id, input, userId: user.sub }
                )
            );
            return successResponse({ deck: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to update flashcard deck');
        }
    }

    @Delete(':id')
    async deleteDeck(@Param('id') id: string, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.flashcard-deck.delete' },
                    { id, userId: user.sub }
                )
            );
            return successResponse(null, 'Deck deleted successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete flashcard deck');
        }
    }
}
