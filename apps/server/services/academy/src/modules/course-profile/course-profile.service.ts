import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { Prisma } from '@prisma/generated';
import {
  AcademyCourseProfileCreateDTO,
  AcademyCourseProfileQueryDTO,
  AcademyCourseProfileUpdateDTO,
} from '@workspace/schemas';
import { AuditLoggerService } from '../audit-logger.service';

import { SyllabusService } from './syllabus.service';

@Injectable()
export class CourseProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly syllabus: SyllabusService,
    private readonly audit: AuditLoggerService,
  ) { }

  async findAll(query: AcademyCourseProfileQueryDTO) {
    const andFilters: Prisma.CourseProfileWhereInput[] = [];

    if (query.level) {
      andFilters.push({ level: query.level });
    }

    if (query.q) {
      andFilters.push({
        OR: [
          { code: { contains: query.q, mode: 'insensitive' } },
          { title: { contains: query.q, mode: 'insensitive' } },
        ],
      });
    }

    const where: Prisma.CourseProfileWhereInput =
      andFilters.length > 0 ? { AND: andFilters } : {};

    return this.prisma.courseProfile.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }],
    });
  }

  async findById(id: string) {
    const item = await this.prisma.courseProfile.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('CourseProfile not found');
    return item;
  }

  async create(input: AcademyCourseProfileCreateDTO, requesterId?: string) {
    const exists = await this.prisma.courseProfile.findUnique({
      where: { code: input.code },
      select: { id: true },
    });
    if (exists) throw new BadRequestException('CourseProfile code already exists');

    const item = await this.prisma.courseProfile.create({
      data: {
        code: input.code,
        title: input.title,
        description: input.description ?? null,
        level: input.level ?? null,
        thumbnailUrl: input.thumbnailUrl ?? null,
        metadata: {},
      },
    });

    if (requesterId) {
      await this.audit.log({
        userId: requesterId,
        action: 'CREATE',
        entity: 'CourseProfile',
        entityId: item.id,
        description: `Create course profile ${item.code}`,
        newValues: item,
      });
    }

    return item;
  }

  async update(id: string, input: AcademyCourseProfileUpdateDTO, requesterId?: string) {
    const before = await this.prisma.courseProfile.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('CourseProfile not found');

    const item = await this.prisma.courseProfile.update({
      where: { id },
      data: {
        title: input.title ?? undefined,
        description: input.description ?? undefined,
        level: input.level ?? undefined,
        thumbnailUrl: input.thumbnailUrl ?? undefined,
      },
    });

    if (requesterId) {
      await this.audit.log({
        userId: requesterId,
        action: 'UPDATE',
        entity: 'CourseProfile',
        entityId: id,
        description: `Update course profile ${before.code}`,
        oldValues: before,
        newValues: item,
      });
    }

    return item;
  }

  async archive(id: string, requesterId?: string) {
    const before = await this.prisma.courseProfile.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('CourseProfile not found');

    const merged = {
      ...(typeof before.metadata === 'object' && before.metadata ? (before.metadata as any) : {}),
      isArchived: true,
      archivedAt: new Date().toISOString(),
    };

    const item = await this.prisma.courseProfile.update({
      where: { id },
      data: { metadata: merged as any },
    });

    if (requesterId) {
      await this.audit.log({
        userId: requesterId,
        action: 'ARCHIVE',
        entity: 'CourseProfile',
        entityId: id,
        description: `Archive course profile ${before.code}`,
        oldValues: before,
        newValues: item,
      });
    }

    return item;
  }

  async delete(id: string, requesterId?: string) {
    const before = await this.prisma.courseProfile.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('CourseProfile not found');

    const [classes, syllabuses, exams, pools] = await this.prisma.$transaction([
      this.prisma.class.count({ where: { courseProfileId: id } }),
      this.prisma.syllabus.count({ where: { courseProfileId: id } }),
      this.prisma.exam.count({ where: { courseProfileId: id } }),
      this.prisma.questionPool.count({ where: { courseProfileId: id } }),
    ]);

    if (classes || syllabuses || exams || pools) {
      throw new BadRequestException(
        'Không thể xoá CourseProfile vì đã có dữ liệu liên quan (classes/syllabuses/exams/questionPools). Hãy dùng Lưu trữ.',
      );
    }

    await this.prisma.courseProfile.delete({ where: { id } });

    if (requesterId) {
      await this.audit.log({
        userId: requesterId,
        action: 'DELETE',
        entity: 'CourseProfile',
        entityId: id,
        description: `Delete course profile ${before.code}`,
        oldValues: before,
      });
    }

    return { ok: true };
  }

  // --- Syllabus Delegates ---

  async findAllSyllabi(courseProfileId: string) {
    return this.syllabus.findAll(courseProfileId);
  }

  async findSyllabusById(id: string) {
    return this.syllabus.findById(id);
  }

  async createSyllabus(input: { courseProfileId: string; version: string; sourceSyllabusId?: string; requesterId?: string }) {
    return this.syllabus.create(input.courseProfileId, input.version, input.sourceSyllabusId, input.requesterId);
  }

  async cloneSyllabus(input: { sourceSyllabusId: string; newVersion: string; requesterId?: string }) {
    return this.syllabus.create('', input.newVersion, input.sourceSyllabusId, input.requesterId);
    // Note: SyllabusService.create handles sourceId, but we might need to find the courseProfileId first
  }

  async publishSyllabus(id: string, requesterId?: string) {
    return this.syllabus.publish(id, requesterId);
  }

  async lockSyllabus(id: string, requesterId?: string) {
    // lock doesn't take requesterId in service yet, but we'll call it
    return this.syllabus.lock(id);
  }
}

