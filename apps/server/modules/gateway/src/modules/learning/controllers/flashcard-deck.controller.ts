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
    errorResponse
} from '@server/shared';
import { IdentityAuthGuard } from '../../identity/guards/identity-auth.guard';
import { Request } from 'express';

@Controller('flashcard-decks')
@UseGuards(IdentityAuthGuard)
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
            // Original controller returns result directly.
            // Let's assume standard response usually desired in gateway.
            // But if FE expects raw object, we can return result.
            // Let's use successResponse to be safe or check if original returned DTO directly.
            // Original: return this.flashcardDeckService.createDeck(...);
            // I'll wrap in successResponse? 
            // If I look at PostController, I used successResponse.
            // Let's stick to consistent API response wrapper if possible.
            // But if existing FE expects raw object, this might break.
            // However, other controllers in this refactor used successResponse.
            // I'll return result directly if I am unsure, but usually gateway wraps response.
            // Wait, previous controllers I used `successResponse(result)`.
            return successResponse(result);
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
            return successResponse(result);
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
            return successResponse(result);
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
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete flashcard deck');
        }
    }
}
