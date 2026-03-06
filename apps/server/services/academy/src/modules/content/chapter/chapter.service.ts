import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
  ChapterCreateDto,
  ChapterQueryDto,
  ChapterReorderDto,
  ChapterUpdateDto,
} from './dto/chapter.dto';

@Injectable()
export class ChapterService {
  constructor(private readonly prisma: PrismaService) { }

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

  async create(input: ChapterCreateDto) {
    const edition = await this.prisma.courseEdition.findUnique({
      where: { id: input.courseEditionId },
      select: { id: true },
    });
    if (!edition) throw new BadRequestException('Invalid courseEditionId');

    return this.prisma.chapter.create({
      data: {
        courseEditionId: input.courseEditionId,
        title: input.title,
        description: input.description,
        orderIndex: input.orderIndex,
        estimatedMinutes: input.estimatedMinutes,
        status: input.status ?? 'DRAFT',
      },
    });
  }

  async update(id: string, input: ChapterUpdateDto) {
    await this.findById(id);
    return this.prisma.chapter.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        orderIndex: input.orderIndex,
        estimatedMinutes: input.estimatedMinutes,
        status: input.status,
      },
    });
  }

  async reorderChapters(input: ChapterReorderDto) {
    // Transactional update of orderIndex
    await this.prisma.$transaction(
      input.orderedIds.map((id, index) =>
        this.prisma.chapter.update({
          where: { id, courseEditionId: input.courseEditionId },
          data: { orderIndex: index },
        }),
      ),
    );
    return { ok: true };
  }

  async delete(id: string) {
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
    return { ok: true };
  }
}

