import { Module } from '@nestjs/common';
import { SharedModule } from '@server/shared';
import { FlashcardDeckController } from './flashcard-deck.controller';
import { FlashcardDeckService } from './flashcard-deck.service';

@Module({
  imports: [SharedModule],
  controllers: [FlashcardDeckController],
  providers: [FlashcardDeckService],
})
export class FlashcardDeckModule {}



