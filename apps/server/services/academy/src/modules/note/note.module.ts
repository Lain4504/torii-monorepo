import { Module } from '@nestjs/common';
import { PrismaModule } from '@server/shared/prisma/prisma.module';
import { NoteHandler } from './note.handler';
import { NoteService } from './note.service';
import { FlashcardModule } from '../flashcard/flashcard.module';

@Module({
    imports: [PrismaModule, FlashcardModule],
    controllers: [NoteHandler],
    providers: [NoteService],
    exports: [NoteService],
})
export class NoteModule { }
