import { Module } from '@nestjs/common';
import { PrismaModule } from '@server/shared/prisma/prisma.module';
import { FlashcardHandler } from './flashcard.handler';
import { FlashcardService } from './flashcard.service';

@Module({
    imports: [PrismaModule],
    controllers: [FlashcardHandler],
    providers: [FlashcardService],
    exports: [FlashcardService],
})
export class FlashcardModule { }
