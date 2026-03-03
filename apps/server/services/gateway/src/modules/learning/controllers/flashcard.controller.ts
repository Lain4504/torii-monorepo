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
    HttpException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
    successResponse,
    successPaginatedResponse,
    GatewayAuthGuard,
    ReqWithRequester,
} from '@server/shared';

@Controller('api/flashcards')
@UseGuards(GatewayAuthGuard)
export class FlashcardController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post()
    async createFlashcard(@Body() input: any, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.flashcard.create' },
                    { ...input, userId: requester.sub }
                )
            );
            return successResponse({ flashcard: result });
        } catch (error: any) {
            throw new HttpException(error.message || 'Failed to create flashcard', error.status || 400);
        }
    }

    @Get()
    async getFlashcards(@Query() query: any, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.flashcard.findAll' },
                    { query, userId: requester.sub }
                )
            );
            return successPaginatedResponse(result);
        } catch (error: any) {
            throw new HttpException(error.message || 'Failed to fetch flashcards', error.status || 400);
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
            throw new HttpException(error.message || 'Failed to fetch flashcard', error.status || 400);
        }
    }

    @Patch()
    async updateFlashcard(@Body() input: any, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.flashcard.update' },
                    { ...input, userId: requester.sub }
                )
            );
            return successResponse({ flashcard: result });
        } catch (error: any) {
            throw new HttpException(error.message || 'Failed to update flashcard', error.status || 400);
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
            throw new HttpException(error.message || 'Failed to delete flashcard', error.status || 400);
        }
    }

    @Post('bulk')
    async bulkOperations(@Body() data: any, @Req() req: ReqWithRequester) {
        try {
            const requester = req.requester;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.flashcard.bulk' },
                    { ...data, userId: requester.sub }
                )
            );
            return successResponse(result);
        } catch (error: any) {
            throw new HttpException(error.message || 'Failed to perform bulk operations', error.status || 400);
        }
    }
}
