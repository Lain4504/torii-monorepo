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

  async findByCourseProfileId(courseProfileId: string) {
    return this.prisma.courseEdition.findMany({
      where: { courseProfileId },
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async create(input: CourseEditionCreateDto, requesterId = 'SYSTEM') {
    const profile = await this.prisma.courseProfile.findUnique({
      where: { id: input.courseProfileId },
      select: { id: true },
    });
    if (!profile) throw new BadRequestException('Invalid courseProfileId');

    const edition = await this.prisma.courseEdition.create({
      data: {
        courseProfileId: input.courseProfileId,
        editionTag: input.editionTag,
        status: input.status ?? 'DRAFT',
        syllabusSnapshot: input.syllabusSnapshot ?? undefined,
        changelog: input.changelog,
      },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'edition.create',
      entity: 'CourseEdition',
      entityId: edition.id,
      description: `Created course edition: ${edition.editionTag} for profile ${input.courseProfileId}`,
      newValues: { editionTag: edition.editionTag, status: edition.status },
    });

    return edition;
  }

  async update(id: string, input: CourseEditionUpdateDto, requesterId = 'SYSTEM') {
    const old = await this.findById(id);

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

    const updated = await this.prisma.courseEdition.update({
      where: { id },
      data: {
        editionTag: input.editionTag,
        isCurrent: input.isCurrent,
        status: input.status,
        syllabusSnapshot: input.syllabusSnapshot ?? undefined,
        changelog: input.changelog,
      },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'edition.update',
      entity: 'CourseEdition',
      entityId: id,
      description: `Updated edition ${old.editionTag}`,
      oldValues: { status: old.status, isCurrent: old.isCurrent, editionTag: old.editionTag },
      newValues: { status: updated.status, isCurrent: updated.isCurrent, editionTag: updated.editionTag },
    });

    return updated;
  }

  async setCurrent(id: string, requesterId = 'SYSTEM') {
    const edition = await this.findById(id);
    if (edition.status !== 'PUBLISHED') {
      throw new BadRequestException('Only PUBLISHED editions can be set as current');
    }

    await this.prisma.courseEdition.updateMany({
      where: { courseProfileId: edition.courseProfileId, isCurrent: true },
      data: { isCurrent: false },
    });
    const result = await this.prisma.courseEdition.update({
      where: { id },
      data: { isCurrent: true },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'edition.setCurrent',
      entity: 'CourseEdition',
      entityId: id,
      description: `Set edition ${edition.editionTag} as current for profile ${edition.courseProfileId}`,
    });

    return result;
  }

  async publishEdition(id: string, requesterId = 'SYSTEM') {
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
      userId: requesterId, // In a real app, pass the actual user ID
      action: 'edition.publish',
      entity: 'CourseEdition',
      entityId: id,
      description: `Published course edition ${edition.editionTag}`,
      metadata: { editionTag: edition.editionTag },
    });

    return result;
  }

  async archiveEdition(id: string, requesterId = 'SYSTEM') {
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
      userId: requesterId,
      action: 'edition.archive',
      entity: 'CourseEdition',
      entityId: id,
      description: `Archived course edition ${edition.editionTag}`,
    });

    return result;
  }

  async delete(id: string, requesterId = 'SYSTEM') {
    const edition = await this.findById(id);
    if (edition.status === 'PUBLISHED') {
      throw new BadRequestException('Cannot delete a PUBLISHED edition. Archive it instead.');
    }
    await this.prisma.courseEdition.delete({ where: { id } });

    await this.audit.log({
      userId: requesterId,
      action: 'edition.delete',
      entity: 'CourseEdition',
      entityId: id,
      description: `Deleted course edition ${edition.editionTag} (status was: ${edition.status})`,
      metadata: { editionTag: edition.editionTag, status: edition.status },
    });

    return { ok: true };
  }
}

