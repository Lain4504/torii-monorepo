import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { LessonCreateDto, LessonQueryDto, LessonUpdateDto } from './dto/lesson.dto';

@Injectable()
export class LessonService {
  constructor(private readonly prisma: PrismaService) { }

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

  async getUsage(id: string) {
    const chapterItems = await this.prisma.chapterItem.findMany({
      where: { kind: 'LESSON', referenceId: id },
      include: {
        chapter: {
          include: { courseEdition: { include: { courseProfile: true } } },
        },
      },
    });

    const activeProgressCount = await this.prisma.learningProgress.count({
      where: { lessonId: id },
    });

    return {
      chapterItems: chapterItems.map((ci) => ({
        chapterId: ci.chapterId,
        chapterTitle: ci.chapter.title,
        editionId: ci.chapter.courseEditionId,
        editionStatus: ci.chapter.courseEdition.status,
        courseTitle: ci.chapter.courseEdition.courseProfile?.title,
      })),
      activeProgressCount,
    };
  }

  async delete(id: string) {
    const usage = await this.getUsage(id);

    // Check if used in any PUBLISHED edition
    const publishedUsage = usage.chapterItems.filter((u) => u.editionStatus === 'PUBLISHED');
    if (publishedUsage.length > 0) {
      throw new BadRequestException(
        `Cannot delete lesson used in PUBLISHED editions: ${publishedUsage
          .map((u) => u.editionId)
          .join(', ')}`,
      );
    }

    if (usage.activeProgressCount > 0) {
      throw new BadRequestException(
        `Cannot delete lesson with ${usage.activeProgressCount} active learning progress records`,
      );
    }

    await this.prisma.lesson.delete({ where: { id } });
    return { ok: true };
  }
}

