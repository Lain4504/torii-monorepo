import { Module } from '@nestjs/common';
import { FlashcardModule } from './flashcard/flashcard.module';

@Module({
    imports: [FlashcardModule],
    controllers: [],
    providers: [],
})
export class AiServiceModule { }
