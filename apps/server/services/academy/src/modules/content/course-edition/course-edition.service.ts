import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
  CourseEditionCreateDto,
  CourseEditionQueryDto,
  CourseEditionUpdateDto,
} from './dto/course-edition.dto';

@Injectable()
export class CourseEditionService {
  constructor(private readonly prisma: PrismaService) { }

  async findAll(query: CourseEditionQueryDto) {
    return this.prisma.courseEdition.findMany({
      where: {
        courseProfileId: query.courseProfileId ?? undefined,
        isCurrent: query.isCurrent ?? undefined,
      },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async findById(id: string) {
    const item = await this.prisma.courseEdition.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('CourseEdition not found');
    return item;
  }

  async create(input: CourseEditionCreateDto) {
    const profile = await this.prisma.courseProfile.findUnique({
      where: { id: input.courseProfileId },
      select: { id: true },
    });
    if (!profile) throw new BadRequestException('Invalid courseProfileId');

    return this.prisma.courseEdition.create({
      data: {
        courseProfileId: input.courseProfileId,
        editionTag: input.editionTag,
        status: input.status ?? 'DRAFT',
        syllabusSnapshot: input.syllabusSnapshot ?? undefined,
        changelog: input.changelog,
      },
    });
  }

  async update(id: string, input: CourseEditionUpdateDto) {
    await this.findById(id);

    if (input.isCurrent === true) {
      // ensure only 1 current per CourseProfile
      const edition = await this.prisma.courseEdition.findUnique({
        where: { id },
        select: { courseProfileId: true },
      });
      if (edition) {
        await this.prisma.courseEdition.updateMany({
          where: { courseProfileId: edition.courseProfileId, isCurrent: true },
          data: { isCurrent: false },
        });
      }
    }

    return this.prisma.courseEdition.update({
      where: { id },
      data: {
        editionTag: input.editionTag,
        isCurrent: input.isCurrent,
        status: input.status,
        syllabusSnapshot: input.syllabusSnapshot ?? undefined,
        changelog: input.changelog,
      },
    });
  }

  async setCurrent(id: string) {
    const edition = await this.findById(id);
    if (edition.status !== 'PUBLISHED') {
      throw new BadRequestException('Only PUBLISHED editions can be set as current');
    }

    await this.prisma.courseEdition.updateMany({
      where: { courseProfileId: edition.courseProfileId, isCurrent: true },
      data: { isCurrent: false },
    });
    return this.prisma.courseEdition.update({
      where: { id },
      data: { isCurrent: true },
    });
  }

  async publishEdition(id: string) {
    const edition = await this.prisma.courseEdition.findUnique({
      where: { id },
      include: {
        chapters: {
          include: { items: true },
        },
      },
    });
    if (!edition) throw new NotFoundException('CourseEdition not found');
    if (edition.status === 'PUBLISHED') return edition;
    if (edition.status === 'ARCHIVED') {
      throw new BadRequestException('Cannot publish an ARCHIVED edition');
    }

    // Validate syllabus: check for duplicate orderIndex in chapters
    const chapterIndexes = edition.chapters.map((c) => c.orderIndex);
    if (new Set(chapterIndexes).size !== chapterIndexes.length) {
      throw new BadRequestException('Chapters have duplicate orderIndex');
    }

    // Validate items: check for duplicate orderIndex within each chapter
    for (const chapter of edition.chapters) {
      const itemIndexes = chapter.items.map((i) => i.orderIndex);
      if (new Set(itemIndexes).size !== itemIndexes.length) {
        throw new BadRequestException(
          `Chapter "${chapter.title}" has items with duplicate orderIndex`,
        );
      }
    }

    return this.prisma.courseEdition.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });
  }

  async archiveEdition(id: string) {
    const edition = await this.prisma.courseEdition.findUnique({
      where: { id },
      include: { classes: { where: { status: { in: ['ENROLLING', 'IN_PROGRESS'] } } } },
    });
    if (!edition) throw new NotFoundException('CourseEdition not found');

    if (edition.classes.length > 0) {
      throw new BadRequestException(
        'Cannot archive edition with active classes (ENROLLING/IN_PROGRESS)',
      );
    }

    return this.prisma.courseEdition.update({
      where: { id },
      data: { status: 'ARCHIVED', isCurrent: false },
    });
  }

  async delete(id: string) {
    const edition = await this.findById(id);
    if (edition.status === 'PUBLISHED') {
      throw new BadRequestException('Cannot delete a PUBLISHED edition. Archive it instead.');
    }
    await this.prisma.courseEdition.delete({ where: { id } });
    return { ok: true };
  }
}

