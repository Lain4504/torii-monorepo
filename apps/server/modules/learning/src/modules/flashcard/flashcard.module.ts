import { Module } from '@nestjs/common';
import { SharedModule } from '@server/shared';
import { FlashcardService } from './flashcard.service';
import { SrsAlgorithmService } from './srs-algorithm.service';
import { FlashcardReviewService } from './flashcard-review.service';
import { FlashcardReviewSessionService } from './flashcard-review-session.service';

@Module({
    imports: [SharedModule],
    controllers: [],
    providers: [
        FlashcardService,
        SrsAlgorithmService,
        FlashcardReviewService,
        FlashcardReviewSessionService,
    ],
    exports: [
        FlashcardService,
        SrsAlgorithmService,
        FlashcardReviewService,
        FlashcardReviewSessionService,
    ],
})
export class FlashcardModule { }
