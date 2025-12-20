import { Module } from '@nestjs/common';
import { SharedModule } from '@server/shared';
import { FlashcardController } from './flashcard.controller';
import { FlashcardService } from './flashcard.service';

@Module({
    imports: [SharedModule],
    controllers: [FlashcardController],
    providers: [FlashcardService],
})
export class FlashcardModule { }
