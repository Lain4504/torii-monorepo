import { Module } from '@nestjs/common';
import { FlashcardModule } from './modules/flashcard/flashcard.module';
import { FlashcardDeckModule } from './modules/flashcard-deck/flashcard-deck.module';
import { FlashcardController } from './interfaces/nats/flashcard.controller';
import { FlashcardDeckController } from './interfaces/nats/flashcard-deck.controller';

@Module({
    imports: [FlashcardModule, FlashcardDeckModule],
    controllers: [FlashcardController, FlashcardDeckController],
    providers: [],
})
export class FlashcardsModule { }
