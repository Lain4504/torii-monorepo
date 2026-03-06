import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { CreateNoteDto, UpdateNoteDto } from './note.dto';

@Injectable()
export class NoteService {
    constructor(private prisma: PrismaService) { }

    async createNote(userId: string, dto: CreateNoteDto) {
        return this.prisma.note.create({
            data: {
                userId,
                ...dto,
            },
        });
    }

    async getNotes(userId: string, lessonId?: string, tags?: string[]) {
        return this.prisma.note.findMany({
            where: {
                userId,
                ...(lessonId && { lessonId }),
                ...(tags?.length && { tags: { hasSome: tags } }),
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async updateNote(userId: string, noteId: string, dto: UpdateNoteDto) {
        const note = await this.prisma.note.findFirst({
            where: { id: noteId, userId },
        });
        if (!note) {
            throw new NotFoundException('Note not found');
        }
        return this.prisma.note.update({
            where: { id: noteId },
            data: dto,
        });
    }

    async deleteNote(userId: string, noteId: string) {
        const note = await this.prisma.note.findFirst({
            where: { id: noteId, userId },
        });
        if (!note) {
            throw new NotFoundException('Note not found');
        }
        return this.prisma.note.delete({
            where: { id: noteId },
        });
    }
}
