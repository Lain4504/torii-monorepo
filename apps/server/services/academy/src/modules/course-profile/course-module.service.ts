import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import type { Prisma } from '@prisma/generated';
import { AuditLoggerService } from '../audit-logger.service';

export interface CourseModuleCreateDto {
  courseProfileId: string;
  title: string;
  orderIndex?: number;
}

export interface CourseModuleUpdateDto {
  title?: string;
  orderIndex?: number;
}

/**
 * CourseModuleService - Manages modules (chapters) directly linked to CourseProfile.
 * The Syllabus middleman has been removed to simplify management.
 */
@Injectable()
export class CourseModuleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLoggerService,
  ) {}

  async create(input: CourseModuleCreateDto, requesterId?: string) {
    const profile = await this.prisma.courseProfile.findUnique({
      where: { id: input.courseProfileId },
      select: {
        id: true,
        status: true,
        code: true,
      },
    });

    if (!profile) {
      throw new BadRequestException('Invalid courseProfileId');
    }

    if (profile.status === 'ARCHIVED') {
      throw new BadRequestException(
        'Không thể thêm Module vào CourseProfile đã bị lưu trữ (ARCHIVED).',
      );
    }

    const nextOrder =
      input.orderIndex ??
      (await this.prisma.module.count({
        where: { courseProfileId: input.courseProfileId },
      })) + 1;

    const item = await this.prisma.module.create({
      data: {
        courseProfileId: input.courseProfileId,
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
        description: `Tạo module "${item.title}" trong CourseProfile ${profile.code}`,
        newValues: item,
      });
    }

    return item;
  }

  async update(
    id: string,
    input: CourseModuleUpdateDto,
    requesterId?: string,
  ) {
    const before = await this.prisma.module.findUnique({
      where: { id },
      include: {
        courseProfile: {
          select: { status: true, code: true },
        },
      },
    });

    if (!before) {
      throw new NotFoundException('Module not found');
    }

    if (before.courseProfile.status === 'ARCHIVED') {
      throw new BadRequestException(
        'Không thể chỉnh sửa Module của CourseProfile đã bị lưu trữ (ARCHIVED).',
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
        description: `Cập nhật module "${before.title}" trong CourseProfile ${before.courseProfile.code}`,
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
        courseProfile: {
          select: { status: true, code: true },
        },
        _count: { select: { lessons: true } },
      },
    });

    if (!before) {
      throw new NotFoundException('Module not found');
    }

    if (before.courseProfile.status === 'ARCHIVED') {
      throw new BadRequestException(
        'Không thể xóa Module của CourseProfile đã bị lưu trữ (ARCHIVED).',
      );
    }

    await this.prisma.module.delete({ where: { id } });

    if (requesterId) {
      await this.audit.log({
        userId: requesterId,
        action: 'module.delete',
        entity: 'Module',
        entityId: id,
        description: `Xóa module "${before.title}" (bao gồm ${before._count.lessons} lessons) khỏi CourseProfile ${before.courseProfile.code}`,
        oldValues: before,
      });
    }

    return { ok: true };
  }
}
