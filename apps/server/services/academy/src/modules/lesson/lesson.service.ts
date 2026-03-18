import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { LessonType } from '@prisma/generated';
import { AuditLoggerService } from '../audit-logger.service';

export interface LessonCreateDto {
  moduleId: string;
  type: 'VIDEO' | 'READING';
  title: string;
  orderIndex?: number;
  videoUrl?: string;
  content?: string;
}

export interface LessonUpdateDto {
  title?: string;
  type?: 'VIDEO' | 'READING';
  orderIndex?: number;
  videoUrl?: string;
  content?: string | null;
}

export interface LessonQueryDto {
  moduleId?: string;
  syllabusId?: string;
  q?: string;
}

@Injectable()
export class LessonService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLoggerService,
  ) {}

  async findAll(query: LessonQueryDto) {
    const q = query.q?.trim();

    return this.prisma.lesson.findMany({
      where: {
        moduleId: query.moduleId ?? undefined,
        module: query.syllabusId ? { syllabusId: query.syllabusId } : undefined,
        ...(q ? { title: { contains: q, mode: 'insensitive' } } : {}),
      },
      include: {
        module: {
          select: { id: true, title: true, syllabusId: true, orderIndex: true },
        },
      },
      orderBy: [{ module: { orderIndex: 'asc' } }, { orderIndex: 'asc' }],
    });
  }

  async findById(id: string) {
    const item = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        module: {
          select: { id: true, title: true, syllabusId: true },
        },
      },
    });
    if (!item) throw new NotFoundException('Lesson not found');
    return item;
  }

  async create(input: LessonCreateDto, requesterId?: string) {
    // Validate module exists
    const module = await this.prisma.module.findUnique({
      where: { id: input.moduleId },
      select: { id: true, syllabus: { select: { status: true } } },
    });
    if (!module) throw new BadRequestException('Invalid moduleId');

    if (module.syllabus.status === 'LOCKED') {
      throw new BadRequestException(
        'Cannot modify lessons in a LOCKED syllabus',
      );
    }

    const nextOrder =
      input.orderIndex ??
      (await this.prisma.lesson.count({
        where: { moduleId: input.moduleId },
      })) + 1;

    const item = await this.prisma.lesson.create({
      data: {
        moduleId: input.moduleId,
        type: input.type as LessonType,
        title: input.title,
        orderIndex: nextOrder,
        videoUrl: input.videoUrl ?? null,
        content: input.content ?? null,
      },
    });

    if (requesterId) {
      await this.audit.log({
        userId: requesterId,
        action: 'lesson.create',
        entity: 'Lesson',
        entityId: item.id,
        description: `Created ${item.type} lesson "${item.title}" in module ${input.moduleId}`,
        newValues: item,
      });
    }

    return item;
  }

  async update(id: string, input: LessonUpdateDto, requesterId?: string) {
    const before = await this.findById(id);

    // Guard locked syllabus
    const module = await this.prisma.module.findUnique({
      where: { id: before.moduleId },
      select: { syllabus: { select: { status: true } } },
    });
    if (module?.syllabus.status === 'LOCKED') {
      throw new BadRequestException(
        'Cannot modify lessons in a LOCKED syllabus',
      );
    }

    const item = await this.prisma.lesson.update({
      where: { id },
      data: {
        title: input.title ?? undefined,
        type: (input.type as LessonType) ?? undefined,
        orderIndex: input.orderIndex ?? undefined,
        videoUrl: input.videoUrl !== undefined ? input.videoUrl : undefined,
        content: input.content !== undefined ? input.content : undefined,
      },
    });

    if (requesterId) {
      await this.audit.log({
        userId: requesterId,
        action: 'lesson.update',
        entity: 'Lesson',
        entityId: id,
        description: `Updated lesson "${before.title}"`,
        oldValues: before,
        newValues: item,
      });
    }

    return item;
  }

  async delete(id: string, requesterId?: string) {
    const before = await this.findById(id);

    // Guard locked syllabus
    const module = await this.prisma.module.findUnique({
      where: { id: before.moduleId },
      select: { syllabus: { select: { status: true } } },
    });
    if (module?.syllabus.status === 'LOCKED') {
      throw new BadRequestException(
        'Cannot delete lessons from a LOCKED syllabus',
      );
    }

    await this.prisma.lesson.delete({ where: { id } });

    if (requesterId) {
      await this.audit.log({
        userId: requesterId,
        action: 'lesson.delete',
        entity: 'Lesson',
        entityId: id,
        description: `Deleted lesson "${before.title}"`,
        oldValues: before,
      });
    }

    return { ok: true };
  }
}
