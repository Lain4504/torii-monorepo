import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { LessonCreateDto, LessonQueryDto, LessonUpdateDto } from './dto/lesson.dto';

@Injectable()
export class LessonService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: LessonQueryDto) {
    const q = query.q?.trim();
    return this.prisma.lesson.findMany({
      where: {
        courseProfileId: query.courseProfileId ?? undefined,
        ...(q
          ? {
              OR: [{ title: { contains: q, mode: 'insensitive' } }],
            }
          : {}),
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async findById(id: string) {
    const item = await this.prisma.lesson.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Lesson not found');
    return item;
  }

  async create(input: LessonCreateDto) {
    const profile = await this.prisma.courseProfile.findUnique({
      where: { id: input.courseProfileId },
      select: { id: true },
    });
    if (!profile) throw new BadRequestException('Invalid courseProfileId');

    return this.prisma.lesson.create({
      data: {
        courseProfileId: input.courseProfileId,
        title: input.title,
        contentType: input.contentType,
        contentUrl: input.contentUrl,
        contentBody: input.contentBody,
        attachments: input.attachments ?? undefined,
        metadata: input.metadata ?? undefined,
      },
    });
  }

  async update(id: string, input: LessonUpdateDto) {
    await this.findById(id);
    return this.prisma.lesson.update({
      where: { id },
      data: {
        title: input.title,
        contentType: input.contentType,
        contentUrl: input.contentUrl,
        contentBody: input.contentBody,
        attachments: input.attachments ?? undefined,
        metadata: input.metadata ?? undefined,
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.lesson.delete({ where: { id } });
    return { ok: true };
  }
}

