import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@server/shared/prisma/prisma.service';
import { AuditLoggerService } from '../../audit-logger.service';
import {
  CourseProfileCreateDto,
  CourseProfileQueryDto,
  CourseProfileUpdateDto,
} from './dto/course-profile.dto';

@Injectable()
export class CourseProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditLoggerService,
  ) { }

  async findAll(query: CourseProfileQueryDto) {
    const q = query.q?.trim();
    return this.prisma.courseProfile.findMany({
      where: {
        subject: query.subject ?? undefined,
        level: query.level ?? undefined,
        ...(q
          ? {
            OR: [
              { code: { contains: q, mode: 'insensitive' } },
              { title: { contains: q, mode: 'insensitive' } },
            ],
          }
          : {}),
      },
      include: {
        _count: {
          select: { editions: true, classes: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const item = await this.prisma.courseProfile.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('CourseProfile not found');
    return item;
  }

  async create(input: CourseProfileCreateDto, requesterId = 'SYSTEM') {
    const profile = await this.prisma.courseProfile.create({
      data: {
        code: input.code,
        title: input.title,
        shortTitle: input.shortTitle,
        description: input.description,
        subject: input.subject,
        level: input.level,
        defaultLanguage: input.defaultLanguage,
        thumbnailUrl: input.thumbnailUrl,
      },
    });
    await this.audit.log({
      userId: requesterId,
      action: 'courseProfile.create',
      entity: 'CourseProfile',
      entityId: profile.id,
      description: `Created course profile: ${profile.title} (${profile.code})`,
      newValues: { code: profile.code, title: profile.title, subject: profile.subject, level: profile.level },
    });
    return profile;
  }

  async update(id: string, input: CourseProfileUpdateDto, requesterId = 'SYSTEM') {
    const old = await this.findById(id);
    const updated = await this.prisma.courseProfile.update({
      where: { id },
      data: {
        title: input.title,
        shortTitle: input.shortTitle,
        description: input.description,
        subject: input.subject,
        level: input.level,
        defaultLanguage: input.defaultLanguage,
        thumbnailUrl: input.thumbnailUrl,
      },
    });
    await this.audit.log({
      userId: requesterId,
      action: 'courseProfile.update',
      entity: 'CourseProfile',
      entityId: id,
      description: `Updated course profile: ${old.title} (${old.code})`,
      oldValues: { title: old.title, subject: old.subject, level: old.level },
      newValues: { title: updated.title, subject: updated.subject, level: updated.level },
    });
    return updated;
  }

  async archiveProfile(id: string, requesterId = 'SYSTEM') {
    const profile = await this.findById(id);

    // Archive all editions
    await this.prisma.courseEdition.updateMany({
      where: { courseProfileId: id, status: { in: ['PUBLISHED', 'DRAFT'] } },
      data: { status: 'ARCHIVED', isCurrent: false },
    });

    const result = await this.prisma.courseProfile.update({
      where: { id },
      data: {
        metadata: {
          ...(profile.metadata as any),
          isArchived: true,
          archivedAt: new Date().toISOString(),
        },
      },
    });

    await this.audit.log({
      userId: requesterId,
      action: 'courseProfile.archive',
      entity: 'CourseProfile',
      entityId: id,
      description: `Archived course profile: ${profile.title} (${profile.code}) and all its editions`,
    });

    return result;
  }

  async delete(id: string, requesterId = 'SYSTEM') {
    const profile = await this.prisma.courseProfile.findUnique({
      where: { id },
      include: {
        editions: { select: { id: true }, take: 1 },
        classes: { select: { id: true }, take: 1 },
      },
    });
    if (!profile) throw new NotFoundException('CourseProfile not found');

    if (profile.editions.length > 0 || profile.classes.length > 0) {
      throw new BadRequestException(
        'Cannot delete CourseProfile with existing editions or classes. Use archive instead.',
      );
    }

    await this.prisma.courseProfile.delete({ where: { id } });

    await this.audit.log({
      userId: requesterId,
      action: 'courseProfile.delete',
      entity: 'CourseProfile',
      entityId: id,
      description: `Deleted course profile: ${profile.title} (${profile.code})`,
      metadata: { code: profile.code, title: profile.title },
    });

    return { ok: true };
  }
}

