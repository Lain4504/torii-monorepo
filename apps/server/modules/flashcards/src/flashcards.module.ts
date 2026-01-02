import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from '@server/shared';
import { FlashcardModule } from './modules/flashcard/flashcard.module';
import { FlashcardDeckModule } from './modules/flashcard-deck/flashcard-deck.module';
import { FlashcardController } from './interfaces/http/flashcard.controller';
import { FlashcardDeckController } from './interfaces/http/flashcard-deck.controller';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        SharedModule,
        FlashcardModule,
        FlashcardDeckModule
    ],
    controllers: [FlashcardController, FlashcardDeckController],
    providers: [],
})
export class FlashcardsModule { }
