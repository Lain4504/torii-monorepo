import { Module } from '@nestjs/common';
import { SharedModule } from '@server/shared';
import { FlashcardDeckService } from './flashcard-deck.service';

@Module({
  imports: [SharedModule],
  controllers: [],
  providers: [FlashcardDeckService],
  exports: [FlashcardDeckService],
})
export class FlashcardDeckModule { }



