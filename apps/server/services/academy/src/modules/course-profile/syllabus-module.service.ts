import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import type { Prisma } from '@prisma/generated';
import { AuditLoggerService } from '../audit-logger.service';

export interface SyllabusModuleCreateDto {
  syllabusId: string;
  title: string;
  orderIndex?: number;
}

export interface SyllabusModuleUpdateDto {
  title?: string;
  orderIndex?: number;
}

@Injectable()
export class SyllabusModuleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLoggerService,
  ) {}

  async create(input: SyllabusModuleCreateDto, requesterId?: string) {
    const syllabus = await this.prisma.syllabus.findUnique({
      where: { id: input.syllabusId },
      select: { id: true, status: true, courseProfileId: true, versionLabel: true },
    });

    if (!syllabus) {
      throw new BadRequestException('Invalid syllabusId');
    }

    if (syllabus.status === 'LOCKED') {
      throw new BadRequestException(
        'Không thể chỉnh sửa Module của giáo trình đã bị LOCKED.',
      );
    }

    const nextOrder =
      input.orderIndex ??
      (await this.prisma.module.count({ where: { syllabusId: input.syllabusId } })) +
        1;

    const item = await this.prisma.module.create({
      data: {
        syllabusId: input.syllabusId,
        title: input.title,
        orderIndex: nextOrder,
      },
    });

    if (requesterId) {
      await this.audit.log({
        userId: requesterId,
        action: 'module.create',
        entity: 'Module',
        entityId: item.id,
        description: `Tạo module "${item.title}" trong syllabus ${syllabus.versionLabel} (courseProfileId=${syllabus.courseProfileId})`,
        newValues: item,
      });
    }

    return item;
  }

  async update(id: string, input: SyllabusModuleUpdateDto, requesterId?: string) {
    const before = await this.prisma.module.findUnique({
      where: { id },
      include: {
        syllabus: { select: { status: true, versionLabel: true, courseProfileId: true } },
      },
    });

    if (!before) {
      throw new NotFoundException('Module not found');
    }

    if (before.syllabus.status === 'LOCKED') {
      throw new BadRequestException(
        'Không thể chỉnh sửa Module của giáo trình đã bị LOCKED.',
      );
    }

    const data: Prisma.ModuleUpdateInput = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.orderIndex !== undefined) data.orderIndex = input.orderIndex;

    const item = await this.prisma.module.update({
      where: { id },
      data,
    });

    if (requesterId) {
      await this.audit.log({
        userId: requesterId,
        action: 'module.update',
        entity: 'Module',
        entityId: id,
        description: `Cập nhật module "${before.title}" trong syllabus ${before.syllabus.versionLabel}`,
        oldValues: before,
        newValues: item,
      });
    }

    return item;
  }

  async delete(id: string, requesterId?: string) {
    const before = await this.prisma.module.findUnique({
      where: { id },
      include: {
        syllabus: { select: { status: true, versionLabel: true, courseProfileId: true } },
        _count: { select: { lessons: true } },
      },
    });

    if (!before) {
      throw new NotFoundException('Module not found');
    }

    if (before.syllabus.status === 'LOCKED') {
      throw new BadRequestException(
        'Không thể xóa Module của giáo trình đã bị LOCKED.',
      );
    }

    await this.prisma.module.delete({ where: { id } });

    if (requesterId) {
      await this.audit.log({
        userId: requesterId,
        action: 'module.delete',
        entity: 'Module',
        entityId: id,
        description: `Xóa module "${before.title}" (bao gồm ${before._count.lessons} lessons) khỏi syllabus ${before.syllabus.versionLabel}`,
        oldValues: before,
      });
    }

    return { ok: true };
  }
}

