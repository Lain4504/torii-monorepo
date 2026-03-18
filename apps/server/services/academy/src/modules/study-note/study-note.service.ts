import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import { CreateStudyNoteDto, UpdateStudyNoteDto } from './study-note.dto';

@Injectable()
export class StudyNoteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: CreateStudyNoteDto) {
    return this.prisma.studyNote.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  async findAll(userId: string, lessonId?: string) {
    return this.prisma.studyNote.findMany({
      where: {
        userId,
        ...(lessonId ? { lessonId } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, userId: string) {
    const note = await this.prisma.studyNote.findFirst({
      where: { id, userId },
    });
    if (!note) throw new NotFoundException('Study Note not found');
    return note;
  }

  async update(id: string, userId: string, data: UpdateStudyNoteDto) {
    const note = await this.findOne(id, userId);
    return this.prisma.studyNote.update({
      where: { id: note.id },
      data,
    });
  }

  async remove(id: string, userId: string) {
    const note = await this.findOne(id, userId);
    return this.prisma.studyNote.delete({
      where: { id: note.id },
    });
  }
}
