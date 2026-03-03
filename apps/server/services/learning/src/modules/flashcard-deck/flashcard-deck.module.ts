import { Module, forwardRef } from '@nestjs/common';
import { FlashcardDeckHandler } from '@server/learning/modules/flashcard-deck/flashcard-deck.handler';
import { FlashcardReviewHandler } from '@server/learning/modules/flashcard-deck/flashcard-review.handler';
import { SharedModule } from '@server/shared';
import { FlashcardDeckService } from '@server/learning/modules/flashcard-deck/flashcard-deck.service';
import { FlashcardDeckRepository } from '@server/learning/modules/flashcard-deck/flashcard-deck.repository';
import { FLASHCARD_DECK_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories/i-flashcard-deck.repository';
import { FLASHCARD_DECK_SERVICE_TOKEN } from '@server/learning/interfaces/services/i-flashcard-deck.service';
import { FlashcardProfile } from '@server/learning/infrastructure/mappings/flashcard.profile';
import { FlashcardModule } from '@server/learning/modules/flashcard/flashcard.module';

@Module({
  imports: [SharedModule, forwardRef(() => FlashcardModule)],
  controllers: [FlashcardDeckHandler, FlashcardReviewHandler],
  providers: [
    FlashcardProfile,
    {
      provide: FLASHCARD_DECK_REPOSITORY_TOKEN,
      useClass: FlashcardDeckRepository,
    },
    {
      provide: FLASHCARD_DECK_SERVICE_TOKEN,
      useClass: FlashcardDeckService,
    },
  ],
  exports: [FLASHCARD_DECK_SERVICE_TOKEN, FLASHCARD_DECK_REPOSITORY_TOKEN],
})
export class FlashcardDeckModule { }

