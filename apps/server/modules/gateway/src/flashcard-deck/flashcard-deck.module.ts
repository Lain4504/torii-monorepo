import { Module } from '@nestjs/common';
import { NatsClientModule } from '@server/shared';
import { FlashcardDeckController } from './flashcard-deck.controller';

@Module({
  imports: [NatsClientModule],
  controllers: [FlashcardDeckController],
  exports: [],
})
export class FlashcardDeckModule {}



