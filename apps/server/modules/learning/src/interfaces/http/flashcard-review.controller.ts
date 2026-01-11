import {
    Controller,
    Post,
    Get,
    Body,
    Param,
    Query,
    Logger,
    UseGuards,
    Patch,
    Req,
} from '@nestjs/common';
import { GatewayAuthGuard } from '@server/shared';
import type { Request } from 'express';
import { FlashcardReviewService } from '../../modules/flashcard/flashcard-review.service';
import { FlashcardReviewSessionService } from '../../modules/flashcard/flashcard-review-session.service';
import type {
    SubmitReviewDTO,
    FlashcardReviewResponseDTO,
    GetCardsDueDTO,
    CardDueResponseDTO,
    GetUserProgressDTO,
    UserProgressResponseDTO,
    StartReviewSessionDTO,
    CompleteReviewSessionDTO,
    ReviewSessionResponseDTO,
} from '@workspace/schemas';

@Controller('flashcards/reviews')
@UseGuards(GatewayAuthGuard)
export class FlashcardReviewController {
    private readonly logger = new Logger(FlashcardReviewController.name);

    constructor(
        private readonly reviewService: FlashcardReviewService,
        private readonly sessionService: FlashcardReviewSessionService,
    ) {}

    /**
     * Submit a review for a flashcard
     * POST /api/flashcards/reviews/submit
     */
    @Post('submit')
    async submitReview(
        @Req() req: any,
        @Body() body: SubmitReviewDTO,
    ): Promise<FlashcardReviewResponseDTO> {
        const userId = req.user.uid;
        this.logger.log(`Received review submit for user ${userId}, flashcard ${body.flashcardId}`);
        return this.reviewService.submitReview(userId, body);
    }

    /**
     * Get cards due for review
     * GET /api/flashcards/reviews/due
     */
    @Get('due')
    async getCardsDue(
        @Req() req: any,
        @Query() query: GetCardsDueDTO,
    ): Promise<CardDueResponseDTO[]> {
        const userId = req.user.uid;
        this.logger.log(`Getting cards due for user ${userId}`);
        return this.reviewService.getCardsDue(userId, query);
    }

    /**
     * Get user progress for a specific flashcard
     * GET /api/flashcards/reviews/progress/:flashcardId
     */
    @Get('progress/:flashcardId')
    async getUserProgress(
        @Req() req: any,
        @Param('flashcardId') flashcardId: string,
    ): Promise<UserProgressResponseDTO | null> {
        const userId = req.user.uid;
        return this.reviewService.getUserProgress(userId, { flashcardId });
    }

    /**
     * Start a new review session
     * POST /api/flashcards/reviews/sessions
     */
    @Post('sessions')
    async startSession(
        @Req() req: any,
        @Body() body: StartReviewSessionDTO,
    ): Promise<ReviewSessionResponseDTO> {
        const userId = req.user.uid;
        this.logger.log(`Starting review session for user ${userId}, deck ${body.deckId}`);
        return this.sessionService.startSession(userId, body);
    }

    /**
     * Complete a review session
     * PATCH /api/flashcards/reviews/sessions/:sessionId/complete
     */
    @Patch('sessions/:sessionId/complete')
    async completeSession(
        @Req() req: any,
        @Param('sessionId') sessionId: string,
        @Body() body: Partial<CompleteReviewSessionDTO>,
    ): Promise<ReviewSessionResponseDTO> {
        const userId = req.user.uid;
        this.logger.log(`Completing review session ${sessionId} for user ${userId}`);
        return this.sessionService.completeSession(userId, {
            sessionId,
            ...body,
        });
    }

    /**
     * Get review session by ID
     * GET /api/flashcards/reviews/sessions/:sessionId
     */
    @Get('sessions/:sessionId')
    async getSessionById(
        @Req() req: any,
        @Param('sessionId') sessionId: string,
    ): Promise<ReviewSessionResponseDTO> {
        const userId = req.user.uid;
        return this.sessionService.getSessionById(userId, sessionId);
    }

    /**
     * Get recent review sessions
     * GET /api/flashcards/reviews/sessions
     */
    @Get('sessions')
    async getRecentSessions(
        @Req() req: any,
        @Query('deckId') deckId?: string,
        @Query('limit') limit?: string,
    ): Promise<ReviewSessionResponseDTO[]> {
        const userId = req.user.uid;
        const limitNum = limit ? parseInt(limit, 10) : 10;
        return this.sessionService.getRecentSessions(userId, deckId, limitNum);
    }
}

