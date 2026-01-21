import {
    Controller,
    Post,
    Get,
    Patch,
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
    errorResponse
} from '@server/shared';
import { GatewayAuthGuard } from '@server/shared';
import { Request } from 'express';

@Controller('api/flashcards/reviews')
@UseGuards(GatewayAuthGuard)
export class FlashcardReviewController {
    constructor(@Inject('NATS_SERVICE') private readonly natsClient: ClientProxy) { }

    @Post('submit')
    async submitReview(@Body() body: any, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.flashcard-review.submit' },
                    { ...body, userId: user.sub }
                )
            );
            return successResponse({ review: result });
        } catch (error: any) {
            throw new HttpException(error.message || 'Failed to submit review', error.status || 400);
        }
    }

    @Get('due')
    async getCardsDue(@Query() query: any, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.flashcard-review.getDue' },
                    { userId: user.sub, query }
                )
            );
            return successResponse({ flashcards: result });
        } catch (error: any) {
            throw new HttpException(error.message || 'Failed to fetch cards due', error.status || 400);
        }
    }

    @Get('progress/:flashcardId')
    async getUserProgress(@Param('flashcardId') flashcardId: string, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.flashcard-review.getProgress' },
                    { userId: user.sub, flashcardId }
                )
            );
            return successResponse({ progress: result });
        } catch (error: any) {
            throw new HttpException(error.message || 'Failed to fetch user progress', error.status || 400);
        }
    }

    @Post('sessions')
    async startSession(@Body() body: any, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.flashcard-session.start' },
                    { ...body, userId: user.sub }
                )
            );
            return successResponse({ session: result });
        } catch (error: any) {
            throw new HttpException(error.message || 'Failed to start session', error.status || 400);
        }
    }

    @Patch('sessions/:sessionId/complete')
    async completeSession(
        @Param('sessionId') sessionId: string,
        @Body() body: any,
        @Req() req: Request
    ) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.flashcard-session.complete' },
                    { sessionId, body, userId: user.sub }
                )
            );
            return successResponse({ session: result });
        } catch (error: any) {
            throw new HttpException(error.message || 'Failed to complete session', error.status || 400);
        }
    }

    @Get('sessions/:sessionId')
    async getSessionById(@Param('sessionId') sessionId: string, @Req() req: Request) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.flashcard-session.getById' },
                    { sessionId, userId: user.sub }
                )
            );
            return successResponse({ session: result });
        } catch (error: any) {
            throw new HttpException(error.message || 'Failed to fetch session', error.status || 400);
        }
    }

    @Get('sessions')
    async getRecentSessions(
        @Query('deckId') deckId: string,
        @Query('limit') limit: string,
        @Req() req: Request
    ) {
        try {
            const user = req.user as any;
            const result = await firstValueFrom(
                this.natsClient.send(
                    { cmd: 'learning.flashcard-session.getRecent' },
                    {
                        userId: user.sub,
                        deckId,
                        limit: limit ? parseInt(limit, 10) : undefined
                    }
                )
            );
            return successResponse({ sessions: result });
        } catch (error: any) {
            throw new HttpException(error.message || 'Failed to fetch recent sessions', error.status || 400);
        }
    }
}
