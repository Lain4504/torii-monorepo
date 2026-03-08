import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { LessonCreateDto, LessonQueryDto, LessonUpdateDto } from './dto/lesson.dto';
import { AuditLoggerService } from '../../audit-logger.service';

@Injectable()
export class LessonService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLoggerService,
  ) { }

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

  async create(input: LessonCreateDto, requesterId = 'SYSTEM') {
    const profile = await this.prisma.courseProfile.findUnique({
      where: { id: input.courseProfileId },
      select: { id: true },
    });
    if (!profile) throw new BadRequestException('Invalid courseProfileId');

    const result = await this.prisma.lesson.create({
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

    await this.audit.log({
      userId: requesterId,
      action: 'lesson.create',
      entity: 'Lesson',
      entityId: result.id,
      description: `Created lesson: "${result.title}" in course profile ${result.courseProfileId}`,
      newValues: { title: result.title, contentType: result.contentType },
    });

    return result;
  }

  async update(id: string, input: LessonUpdateDto, requesterId = 'SYSTEM') {
    const oldLesson = await this.findById(id);
    const updated = await this.prisma.lesson.update({
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

    await this.audit.log({
      userId: requesterId,
      action: 'lesson.update',
      entity: 'Lesson',
      entityId: id,
      description: `Updated lesson: "${oldLesson.title}"`,
      oldValues: { title: oldLesson.title, contentType: oldLesson.contentType },
      newValues: { title: updated.title, contentType: updated.contentType },
    });

    return updated;
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

  async delete(id: string, requesterId = 'SYSTEM') {
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

    const lesson = await this.prisma.lesson.findUnique({ where: { id } });
    await this.prisma.lesson.delete({ where: { id } });

    await this.audit.log({
      userId: requesterId,
      action: 'lesson.delete',
      entity: 'Lesson',
      entityId: id,
      description: `Deleted lesson: "${lesson?.title}"`,
      metadata: { title: lesson?.title },
    });

    return { ok: true };
  }
}

