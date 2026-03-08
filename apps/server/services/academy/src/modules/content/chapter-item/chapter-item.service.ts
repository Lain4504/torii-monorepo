import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
  ChapterItemCreateDto,
  ChapterItemQueryDto,
  ChapterItemReorderDto,
  ChapterItemUpdateDto,
} from './dto/chapter-item.dto';
import { AuditLoggerService } from '../../audit-logger.service';

@Injectable()
export class ChapterItemService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLoggerService,
  ) { }

  async findAll(query: ChapterItemQueryDto) {
    return this.prisma.chapterItem.findMany({
      where: { chapterId: query.chapterId ?? undefined },
      orderBy: [{ orderIndex: 'asc' }, { id: 'asc' }],
    });
  }

  async findById(id: string) {
    const item = await this.prisma.chapterItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('ChapterItem not found');
    return item;
  }

  private async validateReference(kind: string, referenceId: string) {
    const normalized = kind.toUpperCase();
    if (normalized === 'LESSON') {
      const ok = await this.prisma.lesson.findUnique({
        where: { id: referenceId },
        select: { id: true },
      });
      if (!ok) throw new BadRequestException('Invalid referenceId for LESSON');
    }
    if (normalized === 'QUIZ_TEMPLATE') {
      const ok = await this.prisma.quizTemplate.findUnique({
        where: { id: referenceId },
        select: { id: true },
      });
      if (!ok)
        throw new BadRequestException('Invalid referenceId for QUIZ_TEMPLATE');
    }
    if (normalized === 'ASSIGNMENT_TEMPLATE') {
      const ok = await this.prisma.assignmentTemplate.findUnique({
        where: { id: referenceId },
        select: { id: true },
      });
      if (!ok)
        throw new BadRequestException(
          'Invalid referenceId for ASSIGNMENT_TEMPLATE',
        );
    }
  }

  async create(input: ChapterItemCreateDto, requesterId = 'SYSTEM') {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: input.chapterId },
      select: { id: true },
    });
    if (!chapter) throw new BadRequestException('Invalid chapterId');

    await this.validateReference(input.kind, input.referenceId);

    const result = await this.prisma.chapterItem.create({
      data: {
        chapterId: input.chapterId,
        title: input.title,
        kind: input.kind,
        referenceId: input.referenceId,
        orderIndex: input.orderIndex,
        metadata: input.metadata ?? undefined,
      },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'chapter_item.create',
      entity: 'ChapterItem',
      entityId: result.id,
      description: `Created chapter item: "${result.title}" (${result.kind}) in chapter ${result.chapterId}`,
      newValues: { title: result.title, kind: result.kind },
    });

    return result;
  }

  async update(id: string, input: ChapterItemUpdateDto, requesterId = 'SYSTEM') {
    const oldItem = await this.findById(id);
    const updated = await this.prisma.chapterItem.update({
      where: { id },
      data: {
        title: input.title,
        orderIndex: input.orderIndex,
        metadata: input.metadata ?? undefined,
      },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'chapter_item.update',
      entity: 'ChapterItem',
      entityId: id,
      description: `Updated chapter item: "${oldItem.title}"`,
      oldValues: { title: oldItem.title, orderIndex: oldItem.orderIndex },
      newValues: { title: updated.title, orderIndex: updated.orderIndex },
    });

    return updated;
  }

  async reorderItems(input: ChapterItemReorderDto, requesterId = 'SYSTEM') {
    await this.prisma.$transaction(
      input.orderedIds.map((id, index) =>
        this.prisma.chapterItem.update({
          where: { id, chapterId: input.chapterId },
          data: { orderIndex: index },
        }),
      ),
    );

    await this.audit.log({
      userId: requesterId,
      action: 'chapter_item.reorder',
      entity: 'Chapter',
      entityId: input.chapterId,
      description: `Reordered items in chapter ${input.chapterId}`,
      metadata: { orderedIds: input.orderedIds },
    });

    return { ok: true };
  }

  async delete(id: string, requesterId = 'SYSTEM') {
    const item = await this.prisma.chapterItem.findUnique({
      where: { id },
      include: {
        chapter: {
          include: {
            courseEdition: {
              include: {
                classes: { where: { status: { in: ['ENROLLING', 'IN_PROGRESS'] } } },
              },
            },
          },
        },
      },
    });
    if (!item) throw new NotFoundException('ChapterItem not found');

    if (
      item.chapter.courseEdition.status === 'PUBLISHED' &&
      item.chapter.courseEdition.classes.length > 0
    ) {
      throw new BadRequestException(
        'Cannot delete item from a PUBLISHED edition with active classes',
      );
    }

    await this.prisma.chapterItem.delete({ where: { id } });

    await this.audit.log({
      userId: requesterId,
      action: 'chapter_item.delete',
      entity: 'ChapterItem',
      entityId: id,
      description: `Deleted chapter item: "${item.title}" from chapter ${item.chapterId}`,
      metadata: { title: item.title, chapterId: item.chapterId },
    });

    return { ok: true };
  }
}

