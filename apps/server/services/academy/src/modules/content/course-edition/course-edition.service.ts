import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
  CourseEditionCreateDto,
  CourseEditionQueryDto,
  CourseEditionUpdateDto,
} from './dto/course-edition.dto';
import { AuditLoggerService } from '../../audit-logger.service';

@Injectable()
export class CourseEditionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLoggerService,
  ) { }

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

    // Validate items: check for duplicate orderIndex and correct courseProfileId
    for (const chapter of edition.chapters) {
      const itemIndexes = chapter.items.map((i) => i.orderIndex);
      if (new Set(itemIndexes).size !== itemIndexes.length) {
        throw new BadRequestException(
          `Chapter "${chapter.title}" has items with duplicate orderIndex`,
        );
      }

      for (const item of chapter.items) {
        if (item.kind === 'LESSON') {
          const lesson = await this.prisma.lesson.findUnique({
            where: { id: item.referenceId },
            select: { courseProfileId: true },
          });
          if (lesson?.courseProfileId !== edition.courseProfileId) {
            throw new BadRequestException(`Lesson "${item.title}" does not belong to the correct CourseProfile`);
          }
        }
        // Add similar checks for QUIZ_TEMPLATE and ASSIGNMENT_TEMPLATE if they have courseProfileId
        if (item.kind === 'QUIZ_TEMPLATE') {
          const quiz = await this.prisma.quizTemplate.findUnique({
            where: { id: item.referenceId },
            select: { courseProfileId: true },
          });
          if (quiz?.courseProfileId !== edition.courseProfileId) {
            throw new BadRequestException(`QuizTemplate "${item.title}" does not belong to the correct CourseProfile`);
          }
        }
        if (item.kind === 'ASSIGNMENT_TEMPLATE') {
          const assignment = await this.prisma.assignmentTemplate.findUnique({
            where: { id: item.referenceId },
            select: { courseProfileId: true },
          });
          if (assignment?.courseProfileId !== edition.courseProfileId) {
            throw new BadRequestException(`AssignmentTemplate "${item.title}" does not belong to the correct CourseProfile`);
          }
        }
      }
    }

    const result = await this.prisma.courseEdition.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });

    await this.audit.log({
      userId: 'SYSTEM', // In a real app, pass the actual user ID
      action: 'edition.publish',
      entity: 'CourseEdition',
      entityId: id,
      description: `Published course edition ${edition.editionTag}`,
      metadata: { editionTag: edition.editionTag },
    });

    return result;
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

    const result = await this.prisma.courseEdition.update({
      where: { id },
      data: { status: 'ARCHIVED', isCurrent: false },
    });

    await this.audit.log({
      userId: 'SYSTEM',
      action: 'edition.archive',
      entity: 'CourseEdition',
      entityId: id,
      description: `Archived course edition ${edition.editionTag}`,
    });

    return result;
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

