import { Module } from '@nestjs/common';
import { SharedModule } from '@server/shared';
import { FlashcardDeckService } from '@server/learning/modules/flashcard-deck/flashcard-deck.service';
import { FlashcardDeckRepository } from '@server/learning/modules/flashcard-deck/flashcard-deck.repository';
import { FLASHCARD_DECK_REPOSITORY_TOKEN } from '@server/learning/interfaces/repositories/i-flashcard-deck.repository';
import { FLASHCARD_DECK_SERVICE_TOKEN } from '@server/learning/interfaces/services/i-flashcard-deck.service';
import { FlashcardDeckProfile } from '@server/learning/infrastructure/mappings/flashcard-deck.profile';

@Module({
  imports: [SharedModule],
  providers: [
    {
      provide: FLASHCARD_DECK_REPOSITORY_TOKEN,
      useClass: FlashcardDeckRepository,
    },
    {
      provide: FLASHCARD_DECK_SERVICE_TOKEN,
      useClass: FlashcardDeckService,
    },
    FlashcardDeckProfile,
  ],
  exports: [FLASHCARD_DECK_SERVICE_TOKEN, FLASHCARD_DECK_REPOSITORY_TOKEN],
})
export class FlashcardDeckModule { }

