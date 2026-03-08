import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
  ChapterCreateDto,
  ChapterQueryDto,
  ChapterReorderDto,
  ChapterUpdateDto,
} from './dto/chapter.dto';
import { AuditLoggerService } from '../../audit-logger.service';

@Injectable()
export class ChapterService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLoggerService,
  ) { }

  async findAll(query: ChapterQueryDto) {
    return this.prisma.chapter.findMany({
      where: { courseEditionId: query.courseEditionId ?? undefined },
      orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
    });
  }

  async findById(id: string) {
    const item = await this.prisma.chapter.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Chapter not found');
    return item;
  }

  async create(input: ChapterCreateDto, requesterId = 'SYSTEM') {
    const edition = await this.prisma.courseEdition.findUnique({
      where: { id: input.courseEditionId },
      select: { id: true },
    });
    if (!edition) throw new BadRequestException('Invalid courseEditionId');

    const result = await this.prisma.chapter.create({
      data: {
        courseEditionId: input.courseEditionId,
        title: input.title,
        description: input.description,
        orderIndex: input.orderIndex,
        estimatedMinutes: input.estimatedMinutes,
        status: input.status ?? 'DRAFT',
      },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'chapter.create',
      entity: 'Chapter',
      entityId: result.id,
      description: `Created chapter: "${result.title}" in edition ${result.courseEditionId}`,
      newValues: { title: result.title, orderIndex: result.orderIndex },
    });

    return result;
  }

  async update(id: string, input: ChapterUpdateDto, requesterId = 'SYSTEM') {
    const oldChapter = await this.findById(id);
    const updated = await this.prisma.chapter.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        orderIndex: input.orderIndex,
        estimatedMinutes: input.estimatedMinutes,
        status: input.status,
      },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'chapter.update',
      entity: 'Chapter',
      entityId: id,
      description: `Updated chapter: "${oldChapter.title}"`,
      oldValues: { title: oldChapter.title, status: oldChapter.status },
      newValues: { title: updated.title, status: updated.status },
    });

    return updated;
  }

  async reorderChapters(input: ChapterReorderDto, requesterId = 'SYSTEM') {
    // Transactional update of orderIndex
    await this.prisma.$transaction(
      input.orderedIds.map((id, index) =>
        this.prisma.chapter.update({
          where: { id, courseEditionId: input.courseEditionId },
          data: { orderIndex: index },
        }),
      ),
    );

    await this.audit.log({
      userId: requesterId,
      action: 'chapter.reorder',
      entity: 'CourseEdition',
      entityId: input.courseEditionId,
      description: `Reordered chapters in edition ${input.courseEditionId}`,
      metadata: { orderedIds: input.orderedIds },
    });

    return { ok: true };
  }

  async delete(id: string, requesterId = 'SYSTEM') {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id },
      include: {
        courseEdition: {
          include: {
            classes: { where: { status: { in: ['ENROLLING', 'IN_PROGRESS'] } } },
          },
        },
      },
    });
    if (!chapter) throw new NotFoundException('Chapter not found');

    if (
      chapter.courseEdition.status === 'PUBLISHED' &&
      chapter.courseEdition.classes.length > 0
    ) {
      throw new BadRequestException(
        'Cannot delete chapter from a PUBLISHED edition with active classes',
      );
    }

    await this.prisma.chapter.delete({ where: { id } });

    await this.audit.log({
      userId: requesterId,
      action: 'chapter.delete',
      entity: 'Chapter',
      entityId: id,
      description: `Deleted chapter: "${chapter.title}" from edition ${chapter.courseEditionId}`,
      metadata: { title: chapter.title, editionId: chapter.courseEditionId },
    });

    return { ok: true };
  }
}

