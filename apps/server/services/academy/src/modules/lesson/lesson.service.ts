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
  ) { }

  async findAll(query: AcademyLessonQueryDTO) {
    const q = query.q?.trim();

    return this.prisma.lesson.findMany({
      where: {
        courseProfileId: query.courseProfileId ?? undefined,
        ...(q
          ? {
            title: { contains: q, mode: 'insensitive' },
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

  async create(input: AcademyLessonCreateDTO, requesterId?: string) {
    if (!input.courseProfileId) {
      throw new BadRequestException('courseProfileId is required');
    }

    const item = await this.prisma.lesson.create({
      data: {
        courseProfileId: input.courseProfileId,
        title: input.title,
        contentType: input.contentType,
        contentUrl: input.contentUrl ?? null,
        contentBody: input.contentBody ?? null,
        attachments: input.attachments ?? [],
        metadata: {},
      },
    });

    if (requesterId) {
      await this.audit.log({
        userId: requesterId,
        action: 'CREATE',
        entity: 'Lesson',
        entityId: item.id,
        description: `Create lesson "${item.title}"`,
        newValues: item,
      });
    }

    return item;
  }

  async update(id: string, input: AcademyLessonUpdateDTO, requesterId?: string) {
    const before = await this.prisma.lesson.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Lesson not found');

    const item = await this.prisma.lesson.update({
      where: { id },
      data: {
        title: input.title ?? undefined,
        contentType: input.contentType ?? undefined,
        contentUrl: input.contentUrl ?? undefined,
        contentBody: input.contentBody ?? undefined,
        attachments: input.attachments ?? undefined,
      },
    });

    if (requesterId) {
      await this.audit.log({
        userId: requesterId,
        action: 'UPDATE',
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
    const before = await this.prisma.lesson.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Lesson not found');

    // Rely on DB FKs to prevent deletion when referenced by other data
    await this.prisma.lesson.delete({ where: { id } });

    if (requesterId) {
      await this.audit.log({
        userId: requesterId,
        action: 'DELETE',
        entity: 'Lesson',
        entityId: id,
        description: `Delete lesson "${before.title}"`,
        oldValues: before,
      });
    }

    return { ok: true };
  }
}

