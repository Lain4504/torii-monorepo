import { Module } from '@nestjs/common';
import { SharedModule, NatsClientModule } from '@server/shared';
import { FlashcardService } from '@server/learning/modules/flashcard/flashcard.service';
import { SrsAlgorithmService } from '@server/learning/modules/flashcard/srs-algorithm.service';
import { FlashcardReviewService } from '@server/learning/modules/flashcard/flashcard-review.service';
import { FlashcardReviewSessionService } from '@server/learning/modules/flashcard/flashcard-review-session.service';
import { FlashcardRepository } from '@server/learning/modules/flashcard/flashcard.repository';
import { FlashcardReviewRepository } from '@server/learning/modules/flashcard/flashcard-review.repository';
import { FLASHCARD_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories/i-flashcard.repository';
import { FLASHCARD_SERVICE_TOKEN } from '@server/learning/interfaces/services/i-flashcard.service';
import { FLASHCARD_REVIEW_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories/i-flashcard-review.repository';
import { FLASHCARD_REVIEW_SERVICE_TOKEN } from '@server/learning/interfaces/services/i-flashcard-review.service';
import { FLASHCARD_REVIEW_SESSION_SERVICE_TOKEN } from '@server/learning/interfaces/services/i-flashcard-review-session.service';
import { FlashcardDeckModule } from '@server/learning/modules/flashcard-deck/flashcard-deck.module';
import { FlashcardProfile } from '@server/learning/infrastructure/mappings/flashcard.profile';

@Module({
    imports: [SharedModule, FlashcardDeckModule, NatsClientModule],
    controllers: [],
    providers: [
        {
            provide: FLASHCARD_REPOSITORY_TOKEN,
            useClass: FlashcardRepository,
        },
        {
            provide: FLASHCARD_REVIEW_REPOSITORY_TOKEN,
            useClass: FlashcardReviewRepository,
        },
        {
            provide: FLASHCARD_SERVICE_TOKEN,
            useClass: FlashcardService,
        },
        {
            provide: FLASHCARD_REVIEW_SERVICE_TOKEN,
            useClass: FlashcardReviewService,
        },
        {
            provide: FLASHCARD_REVIEW_SESSION_SERVICE_TOKEN,
            useClass: FlashcardReviewSessionService,
        },
        SrsAlgorithmService,
        FlashcardProfile,
    ],
    exports: [
        FLASHCARD_SERVICE_TOKEN,
        FLASHCARD_REVIEW_SERVICE_TOKEN,
        FLASHCARD_REVIEW_SESSION_SERVICE_TOKEN,
        FLASHCARD_REPOSITORY_TOKEN,
        FLASHCARD_REVIEW_REPOSITORY_TOKEN,
        SrsAlgorithmService,
    ],
})
export class FlashcardModule { }

