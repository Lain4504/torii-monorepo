import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import {
  type AcademyLessonCreateDTO,
  type AcademyLessonQueryDTO,
  type AcademyLessonUpdateDTO,
} from '@workspace/schemas';
import { AuditLoggerService } from '../audit-logger.service';

@Injectable()
export class LessonService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLoggerService,
  ) { } // V2 Strictly Typed

  async findAll(query: AcademyLessonQueryDTO) {
    const q = query.q?.trim();

    return this.prisma.lesson.findMany({
      where: {
        syllabusId: query.syllabusId ?? undefined,
        ...(q
          ? {
            title: { contains: q, mode: 'insensitive' },
          }
          : {}),
      },
      include: {
        quiz: true,
        exam: true,
        assignment: true,
      },
      orderBy: [{ orderIndex: 'asc' }],
    });
  }

  async findById(id: string) {
    const item = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        quiz: true,
        exam: true,
        assignment: true,
      }
    });
    if (!item) throw new NotFoundException('Lesson not found');
    return item;
  }

  async create(input: AcademyLessonCreateDTO, requesterId?: string) {
    if (!input.syllabusId) {
      throw new BadRequestException('syllabusId is required');
    }

    const item = await this.prisma.lesson.create({
      data: {
        syllabusId: input.syllabusId,
        title: input.title,
        orderIndex: input.orderIndex ?? 0,
        type: input.type as any,
        quizId: input.quizId ?? null,
        examId: input.examId ?? null,
        assignmentId: input.assignmentId ?? null,
        contentUrl: input.contentUrl ?? null,
        contentBody: input.contentBody ?? null,
        attachments: input.attachments ?? [],
      },
    });

    if (requesterId) {
      await this.audit.log({
        userId: requesterId,
        action: 'lesson.create',
        entity: 'Lesson',
        entityId: item.id,
        description: `Create lesson "${item.title}" in syllabus ${item.syllabusId}`,
        newValues: item,
      });
    }

    return item;
  }

  async update(id: string, input: AcademyLessonUpdateDTO, requesterId?: string) {
    const before = await this.findById(id);

    const item = await this.prisma.lesson.update({
      where: { id },
      data: {
        title: input.title ?? undefined,
        orderIndex: input.orderIndex ?? undefined,
        type: (input.type as any) ?? undefined,
        quizId: input.quizId !== undefined ? input.quizId : undefined,
        examId: input.examId !== undefined ? input.examId : undefined,
        assignmentId: input.assignmentId !== undefined ? input.assignmentId : undefined,
        contentUrl: input.contentUrl ?? undefined,
        contentBody: input.contentBody ?? undefined,
        attachments: input.attachments ?? undefined,
      },
    });

    if (requesterId) {
      await this.audit.log({
        userId: requesterId,
        action: 'lesson.update',
        entity: 'Lesson',
        entityId: id,
        description: `Update lesson "${before.title}"`,
        oldValues: before,
        newValues: item,
      });
    }

    return item;
  }

  async delete(id: string, requesterId?: string) {
    const before = await this.findById(id);

    await this.prisma.lesson.delete({ where: { id } });

    if (requesterId) {
      await this.audit.log({
        userId: requesterId,
        action: 'lesson.delete',
        entity: 'Lesson',
        entityId: id,
        description: `Delete lesson "${before.title}"`,
        oldValues: before,
      });
    }

    return { ok: true };
  }
}

