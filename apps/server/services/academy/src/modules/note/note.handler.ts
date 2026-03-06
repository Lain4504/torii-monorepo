import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { NoteService } from './note.service';
import { FlashcardService } from '../flashcard/flashcard.service';
import { CreateNoteDto, UpdateNoteDto } from './note.dto';
import { ConvertNoteToFlashcardDto } from '../flashcard/flashcard.dto';

@Controller()
export class NoteHandler {
    constructor(
        private readonly noteService: NoteService,
        private readonly flashcardService: FlashcardService
    ) { }

    @MessagePattern({ cmd: 'academy.note.create' })
    async createNote(@Payload() data: { userId: string; dto: CreateNoteDto }) {
        return this.noteService.createNote(data.userId, data.dto);
    }

    @MessagePattern({ cmd: 'academy.note.findAll' })
    async getNotes(@Payload() data: { userId: string; lessonId?: string; tags?: string[] }) {
        return this.noteService.getNotes(data.userId, data.lessonId, data.tags);
    }

    @MessagePattern({ cmd: 'academy.note.update' })
    async updateNote(@Payload() data: { userId: string; id: string; dto: UpdateNoteDto }) {
        return this.noteService.updateNote(data.userId, data.id, data.dto);
    }

    @MessagePattern({ cmd: 'academy.note.delete' })
    async deleteNote(@Payload() data: { userId: string; id: string }) {
        return this.noteService.deleteNote(data.userId, data.id);
    }

    @MessagePattern({ cmd: 'academy.note.toFlashcard' })
    async convertToFlashcard(@Payload() data: { userId: string; id: string; dto: ConvertNoteToFlashcardDto }) {
        return this.flashcardService.convertNoteToFlashcard(data.userId, data.id, data.dto.deckId);
    }
}
