import { Module } from '@nestjs/common';
import { SharedModule } from '@server/shared';
import { FlashcardDeckService } from './flashcard-deck.service';
import { FlashcardDeckRepository } from './flashcard-deck.repository';
import { FLASHCARD_DECK_REPOSITORY_TOKEN } from '../../interfaces/repositories/i-flashcard-deck.repository';
import { FLASHCARD_DECK_SERVICE_TOKEN } from '../../interfaces/services/i-flashcard-deck.service';

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
  ],
  exports: [FLASHCARD_DECK_SERVICE_TOKEN, FLASHCARD_DECK_REPOSITORY_TOKEN],
})
export class FlashcardDeckModule { }
