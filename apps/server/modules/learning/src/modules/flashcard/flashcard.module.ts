import { Module } from '@nestjs/common';
import { SharedModule } from '@server/shared';
import { FlashcardService } from './flashcard.service';

@Module({
    imports: [SharedModule],
    controllers: [],
    providers: [FlashcardService],
    exports: [FlashcardService],
})
export class FlashcardModule { }
