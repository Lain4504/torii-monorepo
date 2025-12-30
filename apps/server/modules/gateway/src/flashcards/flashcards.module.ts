import { Module } from '@nestjs/common';
import { FlashcardModule } from './flashcard/flashcard.module';
import { FlashcardDeckModule } from './flashcard-deck/flashcard-deck.module';

@Module({
    imports: [
        FlashcardModule,
        FlashcardDeckModule,
    ],
})
export class FlashcardsGatewayModule { }
