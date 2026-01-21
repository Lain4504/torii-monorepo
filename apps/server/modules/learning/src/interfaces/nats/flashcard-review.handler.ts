import { Controller, Inject } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
    SubmitReviewDTO,
    GetCardsDueDTO,
    StartReviewSessionDTO,
    CompleteReviewSessionDTO
} from '@workspace/schemas';
import { IFlashcardReviewService, FLASHCARD_REVIEW_SERVICE_TOKEN } from '../services/i-flashcard-review.service';
import { IFlashcardReviewSessionService, FLASHCARD_REVIEW_SESSION_SERVICE_TOKEN } from '../services/i-flashcard-review-session.service';

@Controller()
export class FlashcardReviewHandler {
    constructor(
        @Inject(FLASHCARD_REVIEW_SERVICE_TOKEN)
        private readonly reviewService: IFlashcardReviewService,
        @Inject(FLASHCARD_REVIEW_SESSION_SERVICE_TOKEN)
        private readonly sessionService: IFlashcardReviewSessionService,
    ) { }

    // Review Service Methods
    @MessagePattern({ cmd: 'learning.flashcard-review.submit' })
    async submitReview(@Payload() data: SubmitReviewDTO & { userId: string }) {
        const { userId, ...body } = data;
        return this.reviewService.submitReview(userId, body);
    }

    @MessagePattern({ cmd: 'learning.flashcard-review.getDue' })
    async getCardsDue(@Payload() data: { userId: string, query: GetCardsDueDTO }) {
        return this.reviewService.getCardsDue(data.userId, data.query);
    }

    @MessagePattern({ cmd: 'learning.flashcard-review.getProgress' })
    async getUserProgress(@Payload() data: { userId: string, flashcardId: string }) {
        return this.reviewService.getUserProgress(data.userId, { flashcardId: data.flashcardId });
    }

    // Session Service Methods
    @MessagePattern({ cmd: 'learning.flashcard-session.start' })
    async startSession(@Payload() data: StartReviewSessionDTO & { userId: string }) {
        const { userId, ...body } = data;
        return this.sessionService.startSession(userId, body);
    }

    @MessagePattern({ cmd: 'learning.flashcard-session.complete' })
    async completeSession(@Payload() data: { sessionId: string, body: any, userId: string }) {
        // Map durationSeconds from body if it exists
        const durationSeconds = data.body?.durationSeconds;
        return this.sessionService.completeSession(data.sessionId, data.userId, { durationSeconds });
    }

    @MessagePattern({ cmd: 'learning.flashcard-session.getById' })
    async getSessionById(@Payload() data: { sessionId: string, userId: string }) {
        return this.sessionService.getSessionById(data.sessionId, data.userId);
    }

    @MessagePattern({ cmd: 'learning.flashcard-session.getRecent' })
    async getRecentSessions(@Payload() data: { userId: string, deckId?: string, limit?: number }) {
        return this.sessionService.getRecentSessions(data.userId, data.deckId, data.limit);
    }
}
