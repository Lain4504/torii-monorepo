import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared';
import {
  CreateStudyNoteDto,
  ShareStudyNoteDto,
  UpdateStudyNoteDto,
} from './study-note.dto';

@Injectable()
export class StudyNoteService {
  constructor(private readonly prisma: PrismaService) {}

  private generateShareToken() {
    return `note_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
  }

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

  async updateSharing(id: string, userId: string, data: ShareStudyNoteDto) {
    const note = await this.findOne(id, userId);
    const metadata = (note.metadata as Record<string, any> | null) ?? {};
    const shareToken =
      data.isPublic && !metadata.shareToken
        ? this.generateShareToken()
        : metadata.shareToken;

    const updated = await this.prisma.studyNote.update({
      where: { id: note.id },
      data: {
        metadata: {
          ...metadata,
          isPublic: data.isPublic,
          shareToken: data.isPublic ? shareToken : null,
        },
      },
    });

    return {
      ...updated,
      shareToken: data.isPublic ? shareToken : null,
      isPublic: data.isPublic,
    };
  }

  async findPublicByToken(token: string) {
    const note = await this.prisma.studyNote.findFirst({
      where: {
        metadata: {
          path: ['shareToken'],
          equals: token,
        },
      },
    });
    if (!note) throw new NotFoundException('Public note not found');

    const metadata = (note.metadata as Record<string, any> | null) ?? {};
    if (!metadata.isPublic) {
      throw new NotFoundException('Public note not found');
    }

    return {
      id: note.id,
      content: note.content,
      tags: note.tags,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }
}
