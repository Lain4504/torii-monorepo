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

@Controller('api/flashcards')
@UseGuards(GatewayAuthGuard)
export class FlashcardController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post()
    async createFlashcard(@Body() input: any, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.flashcard.create' },
                    { ...input, userId: user.sub }
                )
            );
            return successResponse({ flashcard: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to create flashcard');
        }
    }

    @Get()
    async getFlashcards(@Query() query: any, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.flashcard.findAll' },
                    { query, userId: user.sub }
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch flashcards');
        }
    }

    @Get(':id')
    async getFlashcardById(@Param('id') id: string) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.flashcard.findById' },
                    { id }
                )
            );
            return successResponse({ flashcard: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to fetch flashcard');
        }
    }

    @Patch()
    async updateFlashcard(@Body() input: any, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.flashcard.update' },
                    { ...input, userId: user.sub }
                )
            );
            return successResponse({ flashcard: result });
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to update flashcard');
        }
    }

    @Delete(':id')
    async deleteFlashcard(@Param('id') id: string) {
        try {
            await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.flashcard.delete' },
                    { id }
                )
            );
            return successResponse(null, 'Flashcard deleted successfully');
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to delete flashcard');
        }
    }

    @Post('bulk')
    async bulkOperations(@Body() data: any) {
        try {
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.flashcard.bulk' },
                    data
                )
            );
            return successResponse(result);
        } catch (error: any) {
            return errorResponse(error.message || 'Failed to perform bulk operations');
        }
    }
}
