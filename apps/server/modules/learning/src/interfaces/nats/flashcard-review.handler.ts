import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FlashcardReviewService } from '../../modules/flashcard/flashcard-review.service';
import { FlashcardReviewSessionService } from '../../modules/flashcard/flashcard-review-session.service';
import {
    SubmitReviewDTO,
    GetCardsDueDTO,
    StartReviewSessionDTO,
    CompleteReviewSessionDTO
} from '@workspace/schemas';

@Controller()
export class FlashcardReviewHandler {
    constructor(
        private readonly reviewService: FlashcardReviewService,
        private readonly sessionService: FlashcardReviewSessionService,
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
    async completeSession(@Payload() data: { sessionId: string, body: Partial<CompleteReviewSessionDTO>, userId: string }) {
        return this.sessionService.completeSession(data.userId, {
            sessionId: data.sessionId,
            ...data.body,
        });
    }

    @MessagePattern({ cmd: 'learning.flashcard-session.getById' })
    async getSessionById(@Payload() data: { sessionId: string, userId: string }) {
        return this.sessionService.getSessionById(data.userId, data.sessionId);
    }

    @MessagePattern({ cmd: 'learning.flashcard-session.getRecent' })
    async getRecentSessions(@Payload() data: { userId: string, deckId?: string, limit?: number }) {
        return this.sessionService.getRecentSessions(data.userId, data.deckId, data.limit);
    }
}
