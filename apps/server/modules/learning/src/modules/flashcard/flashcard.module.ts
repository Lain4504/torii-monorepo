import { Module } from '@nestjs/common';
import { SharedModule, NatsClientModule } from '@server/shared';
import { FlashcardService } from './flashcard.service';
import { SrsAlgorithmService } from './srs-algorithm.service';
import { FlashcardReviewService } from './flashcard-review.service';
import { FlashcardReviewSessionService } from './flashcard-review-session.service';
import { FlashcardRepository } from './flashcard.repository';
import { FlashcardReviewRepository } from './flashcard-review.repository';
import { FLASHCARD_REPOSITORY_TOKEN } from '../../interfaces/repositories/i-flashcard.repository';
import { FLASHCARD_SERVICE_TOKEN } from '../../interfaces/services/i-flashcard.service';
import { FLASHCARD_REVIEW_REPOSITORY_TOKEN } from '../../interfaces/repositories/i-flashcard-review.repository';
import { FLASHCARD_REVIEW_SERVICE_TOKEN } from '../../interfaces/services/i-flashcard-review.service';
import { FLASHCARD_REVIEW_SESSION_SERVICE_TOKEN } from '../../interfaces/services/i-flashcard-review-session.service';
import { FlashcardDeckModule } from '../flashcard-deck/flashcard-deck.module';

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
